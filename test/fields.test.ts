import { describe, expect, it } from 'vitest';
import { buildFieldMask, placeToLead, resolveFields } from '../src/core/fields';
import type { PlaceV1 } from '../src/core/types';

describe('resolveFields', () => {
  it('resolves known fields in order', () => {
    const defs = resolveFields(['website', 'name']);
    expect(defs.map((d) => d.name)).toEqual(['website', 'name']);
  });

  it('throws on unknown fields', () => {
    expect(() => resolveFields(['name', 'nope'])).toThrow(/Unknown field/);
  });
});

describe('buildFieldMask', () => {
  it('always includes id and prefixes with places.', () => {
    const mask = buildFieldMask(resolveFields(['name', 'phone']));
    const parts = mask.split(',');
    expect(parts).toContain('places.id');
    expect(parts).toContain('places.displayName');
    expect(parts).toContain('places.internationalPhoneNumber');
    expect(parts.every((p) => p.startsWith('places.'))).toBe(true);
  });
});

describe('placeToLead', () => {
  it('extracts only the requested fields', () => {
    const place: PlaceV1 = {
      id: 'abc',
      displayName: { text: 'Test Biz' },
      internationalPhoneNumber: '+33 1',
      nationalPhoneNumber: '01',
      websiteUri: 'https://x.co',
      rating: 4.2,
    };
    const lead = placeToLead(place, resolveFields(['name', 'phone', 'website']));
    expect(lead).toEqual({ name: 'Test Biz', phone: '+33 1', website: 'https://x.co' });
  });

  it('falls back to null for missing values', () => {
    const lead = placeToLead({}, resolveFields(['name', 'rating']));
    expect(lead).toEqual({ name: null, rating: null });
  });
});
