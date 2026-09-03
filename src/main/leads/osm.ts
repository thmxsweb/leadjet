/**
 * OpenStreetMap lead discovery via Nominatim (geocoding) + Overpass (business
 * search). Free, no API key. We ask for local businesses in a city; those
 * without a `website` tag are our strongest "needs a website" opportunities.
 *
 * Respects the OSM usage policy: a descriptive User-Agent and modest limits.
 */

const UA = 'Leadjet/0.0.1 (+https://github.com/thmxsweb/leadjet)';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

export interface RawBusiness {
  name: string;
  category: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
}

/** Overpass tag filters per category key. */
const CATEGORY_FILTERS: Record<string, string[]> = {
  any: ['"shop"', '"craft"', '"office"', '"amenity"~"restaurant|cafe|bar|fast_food|pub"'],
  shops: ['"shop"'],
  food: ['"amenity"~"restaurant|cafe|bar|fast_food|pub|ice_cream"'],
  craft: ['"craft"'],
  services: ['"office"', '"shop"~"hairdresser|travel_agency|estate_agent|car_repair"'],
  beauty: ['"shop"~"hairdresser|beauty|cosmetics|massage"', '"amenity"~"spa"'],
};

async function geocode(city: string): Promise<[number, number, number, number] | null> {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(city)}`;
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ boundingbox?: string[] }>;
  const bb = data[0]?.boundingbox?.map(Number);
  if (!bb || bb.length < 4) return null;
  // Nominatim boundingbox = [south, north, west, east]
  return [bb[0]!, bb[1]!, bb[2]!, bb[3]!];
}

function addressOf(tags: Record<string, string>): string | null {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:postcode'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export async function osmSearch(
  city: string,
  category: string,
  limit: number,
): Promise<RawBusiness[]> {
  const box = await geocode(city);
  if (!box) return [];
  const [south, north, west, east] = box;
  const bbox = `${south},${west},${north},${east}`;

  const filters = CATEGORY_FILTERS[category] ?? CATEGORY_FILTERS.any!;
  const clauses = filters.map((f) => `node[${f}](${bbox});way[${f}](${bbox});`).join('');
  const ql = `[out:json][timeout:25];(${clauses});out center tags ${Math.min(limit * 2, 120)};`;

  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'user-agent': UA, 'content-type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(ql)}`,
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);

  const data = (await res.json()) as {
    elements?: Array<{
      tags?: Record<string, string>;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
    }>;
  };

  const seen = new Set<string>();
  const businesses: RawBusiness[] = [];
  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    businesses.push({
      name,
      category: tags.shop ?? tags.craft ?? tags.office ?? tags.amenity ?? null,
      website: tags.website ?? tags['contact:website'] ?? null,
      phone: tags.phone ?? tags['contact:phone'] ?? null,
      email: tags.email ?? tags['contact:email'] ?? null,
      address: addressOf(tags),
      city: tags['addr:city'] ?? city,
      lat: el.lat ?? el.center?.lat ?? null,
      lon: el.lon ?? el.center?.lon ?? null,
    });
    if (businesses.length >= limit) break;
  }
  // Website-less businesses first (best opportunities).
  return businesses.sort((a, b) => Number(!!a.website) - Number(!!b.website));
}
