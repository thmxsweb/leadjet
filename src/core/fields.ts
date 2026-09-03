import type { Lead, RawLead } from './types.js';

/** Definition of an exportable field. */
export interface FieldDef {
  /** Friendly name used on the CLI and as the output column/key (a RawLead key). */
  name: keyof RawLead;
  /** One-line description for `leadjet fields`. */
  description: string;
  /** Places API v1 field-mask paths this field needs (empty = not from Places). */
  placesMasks: string[];
}

/** The catalog of fields a user can choose to export. */
export const FIELDS: FieldDef[] = [
  { name: 'name', description: 'Business name', placesMasks: ['displayName'] },
  { name: 'address', description: 'Formatted address', placesMasks: ['formattedAddress'] },
  {
    name: 'phone',
    description: 'Phone number',
    placesMasks: ['internationalPhoneNumber', 'nationalPhoneNumber'],
  },
  { name: 'email', description: 'Email (OpenStreetMap only)', placesMasks: [] },
  { name: 'website', description: 'Website URL', placesMasks: ['websiteUri'] },
  { name: 'rating', description: 'Average rating 0-5 (Places only)', placesMasks: ['rating'] },
  {
    name: 'reviews',
    description: 'Number of ratings (Places only)',
    placesMasks: ['userRatingCount'],
  },
  { name: 'maps', description: 'Map URL', placesMasks: ['googleMapsUri'] },
  {
    name: 'type',
    description: 'Business type',
    placesMasks: ['primaryTypeDisplayName', 'primaryType'],
  },
  { name: 'status', description: 'Business status (Places only)', placesMasks: ['businessStatus'] },
  { name: 'lat', description: 'Latitude', placesMasks: ['location'] },
  { name: 'lng', description: 'Longitude', placesMasks: ['location'] },
  { name: 'place_id', description: 'Stable source id (dedup key)', placesMasks: ['id'] },
  { name: 'source', description: 'Which source found the lead', placesMasks: [] },
];

const BY_NAME = new Map(FIELDS.map((f) => [f.name as string, f]));

export const DEFAULT_FIELDS = ['name', 'address', 'phone', 'website', 'rating'];

/** Resolve a list of field names to their definitions, validating each. */
export function resolveFields(names: string[]): FieldDef[] {
  const resolved: FieldDef[] = [];
  const unknown: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const def = BY_NAME.get(name);
    if (def) resolved.push(def);
    else unknown.push(name);
  }
  if (unknown.length) {
    throw new Error(
      `Unknown field(s): ${unknown.join(', ')}. Run "leadjet fields" to see all fields.`,
    );
  }
  return resolved;
}

/** Build the `X-Goog-FieldMask` value for the chosen fields (always includes id). */
export function buildFieldMask(defs: FieldDef[]): string {
  const paths = new Set<string>(['id']);
  for (const def of defs) for (const m of def.placesMasks) paths.add(m);
  return [...paths].map((p) => `places.${p}`).join(',');
}

/** Project a normalized lead down to only the chosen fields, in order. */
export function project(raw: RawLead, defs: FieldDef[]): Lead {
  const lead: Lead = {};
  for (const def of defs) lead[def.name] = raw[def.name];
  return lead;
}
