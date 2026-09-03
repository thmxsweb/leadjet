import { request, USER_AGENT } from './http.js';
import { hasLocation, locationText, type Location } from './location.js';
import type { ProxyRotator } from './proxy.js';
import type { RawLead } from './types.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

export interface OsmSearchOptions {
  term: string;
  location: Location;
  limit: number;
  category?: string;
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

async function geocode(
  query: string,
  proxies?: ProxyRotator,
): Promise<[number, number, number, number] | null> {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await request(
    url,
    { headers: { 'user-agent': USER_AGENT, accept: 'application/json' } },
    proxies,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ boundingbox?: string[] }>;
  const bb = data[0]?.boundingbox?.map(Number);
  if (!bb || bb.length < 4) return null;
  return [bb[0]!, bb[1]!, bb[2]!, bb[3]!]; // [south, north, west, east]
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
  const box = await geocode(where, options.proxies);
  if (!box) throw new Error(`Could not locate "${where}" on OpenStreetMap.`);
  const [south, north, west, east] = box;
  const bbox = `${south},${west},${north},${east}`;

  const filters = filtersFor(options.term, options.category);
  const clauses = filters.map((f) => `node[${f}](${bbox});way[${f}](${bbox});`).join('');
  const ql = `[out:json][timeout:25];(${clauses});out center tags ${Math.min(options.limit * 2, 120)};`;

  const res = await request(
    OVERPASS,
    {
      method: 'POST',
      headers: { 'user-agent': USER_AGENT, 'content-type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(ql)}`,
    },
    options.proxies,
  );
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);

  const data = (await res.json()) as {
    elements?: Array<{
      type?: string;
      id?: number;
      tags?: Record<string, string>;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
    }>;
  };

  const seen = new Set<string>();
  const leads: RawLead[] = [];
  for (const el of data.elements ?? []) {
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
    if (leads.length >= options.limit) break;
  }
  // Website-less businesses first (best "needs a website" opportunities).
  return leads.sort((a, b) => Number(Boolean(a.website)) - Number(Boolean(b.website)));
}
