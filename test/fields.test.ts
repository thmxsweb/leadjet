import { describe, expect, it } from 'vitest';
import { buildFieldMask, project, resolveFields } from '../src/core/fields';
import type { RawLead } from '../src/core/types';

const raw: RawLead = {
  name: 'Test Biz',
  address: '1 Rue X',
  phone: '+33 1',
  email: null,
  website: 'https://x.co',
  rating: 4.2,
  reviews: 10,
  maps: 'https://maps',
  type: 'restaurant',
  status: 'OPERATIONAL',
  lat: 1,
  lng: 2,
  place_id: 'abc',
  source: 'places',
};

describe('resolveFields', () => {
  it('resolves known fields in order', () => {
    expect(resolveFields(['website', 'name']).map((d) => d.name)).toEqual(['website', 'name']);
  });
  it('throws on unknown fields', () => {
    expect(() => resolveFields(['name', 'nope'])).toThrow(/Unknown field/);
  });
});

describe('buildFieldMask', () => {
  it('always includes id and prefixes with places.', () => {
    const parts = buildFieldMask(resolveFields(['name', 'phone'])).split(',');
    expect(parts).toContain('places.id');
    expect(parts).toContain('places.displayName');
    expect(parts).toContain('places.internationalPhoneNumber');
    expect(parts.every((p) => p.startsWith('places.'))).toBe(true);
  });
});

describe('project', () => {
  it('keeps only the requested fields, in order', () => {
    expect(project(raw, resolveFields(['name', 'website', 'source']))).toEqual({
      name: 'Test Biz',
      website: 'https://x.co',
      source: 'places',
    });
  });
});
