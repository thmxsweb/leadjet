/** A geographic target: any of country / region / city. */
export interface Location {
  country?: string;
  region?: string;
  city?: string;
}

/** Parse a distance like "5km", "10 km", "800m" into kilometres. */
export function parseDistance(value?: string): number | undefined {
  if (!value) return undefined;
  const m = value.trim().match(/^([\d.]+)\s*(km|m)?$/i);
  if (!m) return undefined;
  let km = parseFloat(m[1]!);
  if ((m[2] ?? '').toLowerCase() === 'm') km /= 1000;
  return Number.isFinite(km) && km > 0 ? km : undefined;
}

/** Common country names → ISO 3166-1 alpha-2 codes (extend as needed). */
const COUNTRY_CODES: Record<string, string> = {
  canada: 'CA',
  france: 'FR',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  belgium: 'BE',
  belgique: 'BE',
  switzerland: 'CH',
  suisse: 'CH',
  germany: 'DE',
  allemagne: 'DE',
  spain: 'ES',
  espagne: 'ES',
  italy: 'IT',
  italie: 'IT',
  netherlands: 'NL',
  portugal: 'PT',
  ireland: 'IE',
  australia: 'AU',
  luxembourg: 'LU',
  morocco: 'MA',
  maroc: 'MA',
};

/** Resolve a country name or code to an ISO 3166-1 alpha-2 code, if possible. */
export function countryCode(country: string | undefined): string | undefined {
  if (!country) return undefined;
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return COUNTRY_CODES[trimmed.toLowerCase()];
}

/** Human-readable "City, Region, Country" from the parts that are set. */
export function locationText(loc: Location): string {
  return [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
}

/** Build a Places text query from a search term plus a location. */
export function placesQuery(term: string, loc: Location): string {
  const where = locationText(loc);
  return where ? `${term} in ${where}` : term;
}

export function hasLocation(loc: Location): boolean {
  return Boolean(loc.country || loc.region || loc.city);
}
