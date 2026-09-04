import type { Response } from 'undici';
import { request, USER_AGENT } from './http.js';
import { hasLocation, locationText, type Location } from './location.js';
import type { ProxyRotator } from './proxy.js';
import type { RawLead } from './types.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

/** Overpass mirrors, tried in order — instances rate-limit (429) independently. */
const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export interface OsmSearchOptions {
  term: string;
  location: Location;
  limit: number;
  category?: string;
  distanceKm?: number;
  proxies?: ProxyRotator;
}

/** Broad category → Overpass tag filters. */
const CATEGORY_FILTERS: Record<string, string[]> = {
  any: ['"shop"', '"craft"', '"office"', '"amenity"~"restaurant|cafe|bar|fast_food|pub"'],
  shops: ['"shop"'],
  food: ['"amenity"~"restaurant|cafe|bar|fast_food|pub|ice_cream"'],
  craft: ['"craft"'],
  services: ['"office"', '"shop"~"hairdresser|travel_agency|estate_agent|car_repair"'],
  beauty: ['"shop"~"hairdresser|beauty|cosmetics|massage"', '"amenity"~"spa"'],
};

/** Match a free-text term to specific Overpass filters. */
const KEYWORD_FILTERS: { match: RegExp; filters: string[] }[] = [
  { match: /restaurant|resto/i, filters: ['"amenity"="restaurant"'] },
  { match: /caf[eé]|coffee/i, filters: ['"amenity"="cafe"'] },
  { match: /bakery|boulanger|patisserie|pâtisserie/i, filters: ['"shop"="bakery"'] },
  { match: /\bbar\b|pub|brasserie/i, filters: ['"amenity"~"bar|pub"'] },
  { match: /hair|coiffeur|coiffure|salon/i, filters: ['"shop"="hairdresser"'] },
  {
    match: /beauty|beaut[eé]|spa|ongle|nail/i,
    filters: ['"shop"~"beauty|cosmetics"', '"amenity"="spa"'],
  },
  { match: /plumb|plombier/i, filters: ['"craft"="plumber"'] },
  { match: /electric|[eé]lectricien/i, filters: ['"craft"="electrician"'] },
  { match: /dentist|dentiste/i, filters: ['"amenity"="dentist"', '"healthcare"="dentist"'] },
  {
    match: /doctor|m[eé]decin|clinic|clinique/i,
    filters: ['"amenity"="doctors"', '"healthcare"="doctor"'],
  },
  { match: /garage|car.?repair|m[eé]canicien|mechanic/i, filters: ['"shop"="car_repair"'] },
  { match: /florist|fleuriste/i, filters: ['"shop"="florist"'] },
  { match: /butcher|boucher/i, filters: ['"shop"="butcher"'] },
  { match: /pharmacy|pharmacie/i, filters: ['"amenity"="pharmacy"'] },
  { match: /hotel|h[oô]tel/i, filters: ['"tourism"="hotel"'] },
  { match: /gym|fitness|muscu/i, filters: ['"leisure"="fitness_centre"'] },
  { match: /lawyer|avocat|notaire/i, filters: ['"office"="lawyer"'] },
  { match: /real.?estate|immobili|estate.?agent/i, filters: ['"office"="estate_agent"'] },
  { match: /shop|store|magasin|boutique/i, filters: ['"shop"'] },
];

function filtersFor(term: string, category?: string): string[] {
  if (category) return CATEGORY_FILTERS[category] ?? CATEGORY_FILTERS.any!;
  for (const entry of KEYWORD_FILTERS) if (entry.match.test(term)) return entry.filters;
  return ['"shop"', '"craft"', '"office"'];
}

interface Geo {
  south: number;
  north: number;
  west: number;
  east: number;
  lat: number;
  lon: number;
}

async function geocode(query: string, proxies?: ProxyRotator): Promise<Geo | null> {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await request(
    url,
    { headers: { 'user-agent': USER_AGENT, accept: 'application/json' } },
    proxies,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ boundingbox?: string[]; lat?: string; lon?: string }>;
  const first = data[0];
  const bb = first?.boundingbox?.map(Number);
  if (!bb || bb.length < 4) return null;
  return {
    south: bb[0]!,
    north: bb[1]!,
    west: bb[2]!,
    east: bb[3]!,
    lat: Number(first?.lat),
    lon: Number(first?.lon),
  };
}

/** POST an Overpass QL query, falling back across mirrors on failure. */
async function overpass(ql: string, proxies?: ProxyRotator): Promise<Response> {
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await request(
        endpoint,
        {
          method: 'POST',
          headers: {
            'user-agent': USER_AGENT,
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(ql)}`,
        },
        proxies,
      );
      if (res.ok) return res;
      lastError = new Error(`Overpass ${res.status} at ${endpoint}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `All Overpass mirrors failed. Last: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

function addressOf(tags: Record<string, string>): string | null {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:postcode'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** Discover businesses via OpenStreetMap. Requires a location (city/region/country). */
export async function osmSearch(options: OsmSearchOptions): Promise<RawLead[]> {
  if (!hasLocation(options.location)) {
    throw new Error('OpenStreetMap search needs a location — pass --city, --region, or --country.');
  }
  const where = locationText(options.location);
  const geo = await geocode(where, options.proxies);
  if (!geo) throw new Error(`Could not locate "${where}" on OpenStreetMap.`);
  let { south, north, west, east } = geo;
  // A radius around the located point overrides the administrative bounding box.
  if (options.distanceKm && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)) {
    const dLat = options.distanceKm / 111;
    const dLon = options.distanceKm / (111 * Math.max(0.1, Math.cos((geo.lat * Math.PI) / 180)));
    south = geo.lat - dLat;
    north = geo.lat + dLat;
    west = geo.lon - dLon;
    east = geo.lon + dLon;
  }
  const filters = filtersFor(options.term, options.category);
  const clause = (bb: string): string =>
    filters.map((f) => `node[${f}](${bb});way[${f}](${bb});`).join('');

  // Large areas (a whole region/country) overwhelm a single Overpass query and
  // time out — so tile them into cells and sweep from the center outward,
  // stopping once we have enough. Small areas (a city / radius) stay one query.
  const cells = tileCells(south, north, west, east, geo.lat, geo.lon);

  const seen = new Set<string>();
  const leads: RawLead[] = [];
  let okCells = 0;
  let lastErr: unknown;

  for (let i = 0; i < cells.length && leads.length < options.limit; i++) {
    const perCell = Math.min(Math.max((options.limit - leads.length) * 2, 30), 200);
    const ql = `[out:json][timeout:30];(${clause(cells[i]!)});out center tags ${perCell};`;
    try {
      const res = await overpass(ql, options.proxies);
      const data = (await res.json()) as { elements?: OverpassEl[] };
      collect(data.elements ?? [], leads, seen, options.limit);
      okCells += 1;
    } catch (err) {
      lastErr = err; // skip a failed cell and keep sweeping
    }
    if (cells.length > 1 && i < cells.length - 1 && leads.length < options.limit) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
  // If every attempt failed, surface the error rather than pretending "0 leads".
  if (okCells === 0 && lastErr) {
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }
  // Website-less businesses first (best "needs a website" opportunities).
  return leads.sort((a, b) => Number(Boolean(a.website)) - Number(Boolean(b.website)));
}

interface OverpassEl {
  type?: string;
  id?: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
}

/** Append deduped businesses from Overpass elements, up to the limit. */
function collect(elements: OverpassEl[], leads: RawLead[], seen: Set<string>, limit: number): void {
  for (const el of elements) {
    if (leads.length >= limit) break;
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const osmId = `${el.type}/${el.id}`;
    leads.push({
      name,
      address: addressOf(tags),
      phone: tags.phone ?? tags['contact:phone'] ?? null,
      email: tags.email ?? tags['contact:email'] ?? null,
      website: tags.website ?? tags['contact:website'] ?? null,
      rating: null,
      reviews: null,
      maps: `https://www.openstreetmap.org/${osmId}`,
      type:
        tags.shop ??
        tags.craft ??
        tags.office ??
        tags.amenity ??
        tags.tourism ??
        tags.leisure ??
        tags.healthcare ??
        null,
      status: null,
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
      place_id: `osm:${osmId}`,
      source: 'osm',
    });
  }
}

/**
 * Split a bounding box into Overpass-friendly cells, ordered nearest-first to
 * (clat, clon) so dense central areas are swept before the sparse edges.
 * Returns a single cell for small areas (one query, original behavior).
 */
function tileCells(
  s: number,
  n: number,
  w: number,
  e: number,
  clat: number,
  clon: number,
): string[] {
  const width = Math.abs(e - w);
  const height = Math.abs(n - s);
  const MAX_CELLS = 48;
  let cell = 0.22; // ~24 km; comfortably handled by one Overpass query
  let cols = Math.max(1, Math.ceil(width / cell));
  let rows = Math.max(1, Math.ceil(height / cell));
  if (cols * rows > MAX_CELLS) {
    cell *= Math.sqrt((cols * rows) / MAX_CELLS);
    cols = Math.max(1, Math.ceil(width / cell));
    rows = Math.max(1, Math.ceil(height / cell));
  }
  if (cols * rows <= 1) return [`${s},${w},${n},${e}`];

  const cw = width / cols;
  const ch = height / rows;
  const cells: { bb: string; d: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cs = s + r * ch;
      const cn = s + (r + 1) * ch;
      const cwst = w + c * cw;
      const ce = w + (c + 1) * cw;
      const mlat = (cs + cn) / 2;
      const mlon = (cwst + ce) / 2;
      const d = (mlat - clat) ** 2 + (mlon - clon) ** 2;
      cells.push({ bb: `${cs},${cwst},${cn},${ce}`, d });
    }
  }
  cells.sort((a, b) => a.d - b.d);
  return cells.map((x) => x.bb);
}
