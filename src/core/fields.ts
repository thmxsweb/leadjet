import type { Lead, PlaceV1 } from './types.js';

/** Definition of an exportable field: its API field-mask paths and extractor. */
export interface FieldDef {
  /** Friendly name used on the CLI and as the output column/key. */
  name: string;
  /** One-line description for `leadjet fields`. */
  description: string;
  /** Places API v1 field-mask paths this field needs (without the `places.` prefix). */
  masks: string[];
  /** Pull the value out of a place. */
  extract: (place: PlaceV1) => Lead[string];
}

/** The catalog of fields a user can choose to export. */
export const FIELDS: FieldDef[] = [
  {
    name: 'name',
    description: 'Business name',
    masks: ['displayName'],
    extract: (p) => p.displayName?.text ?? null,
  },
  {
    name: 'address',
    description: 'Formatted address',
    masks: ['formattedAddress'],
    extract: (p) => p.formattedAddress ?? null,
  },
  {
    name: 'phone',
    description: 'Phone number (international, else national)',
    masks: ['internationalPhoneNumber', 'nationalPhoneNumber'],
    extract: (p) => p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null,
  },
  {
    name: 'website',
    description: 'Website URL',
    masks: ['websiteUri'],
    extract: (p) => p.websiteUri ?? null,
  },
  {
    name: 'rating',
    description: 'Average Google rating (0-5)',
    masks: ['rating'],
    extract: (p) => p.rating ?? null,
  },
  {
    name: 'reviews',
    description: 'Number of ratings',
    masks: ['userRatingCount'],
    extract: (p) => p.userRatingCount ?? null,
  },
  {
    name: 'maps',
    description: 'Google Maps URL',
    masks: ['googleMapsUri'],
    extract: (p) => p.googleMapsUri ?? null,
  },
  {
    name: 'type',
    description: 'Primary business type',
    masks: ['primaryTypeDisplayName', 'primaryType'],
    extract: (p) => p.primaryTypeDisplayName?.text ?? p.primaryType ?? null,
  },
  {
    name: 'status',
    description: 'Business status (OPERATIONAL, CLOSED_TEMPORARILY, ...)',
    masks: ['businessStatus'],
    extract: (p) => p.businessStatus ?? null,
  },
  {
    name: 'lat',
    description: 'Latitude',
    masks: ['location'],
    extract: (p) => p.location?.latitude ?? null,
  },
  {
    name: 'lng',
    description: 'Longitude',
    masks: ['location'],
    extract: (p) => p.location?.longitude ?? null,
  },
  {
    name: 'place_id',
    description: 'Google Place ID',
    masks: ['id'],
    extract: (p) => p.id ?? null,
  },
];

const BY_NAME = new Map(FIELDS.map((f) => [f.name, f]));

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
  for (const def of defs) for (const m of def.masks) paths.add(m);
  return [...paths].map((p) => `places.${p}`).join(',');
}

/** Convert a place to a lead using only the chosen fields, in order. */
export function placeToLead(place: PlaceV1, defs: FieldDef[]): Lead {
  const lead: Lead = {};
  for (const def of defs) lead[def.name] = def.extract(place);
  return lead;
}
