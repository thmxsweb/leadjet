import { describe, expect, it } from 'vitest';
import { serialize } from '../src/core/export';
import type { Lead } from '../src/core/types';

const leads: Lead[] = [
  { name: 'Café du Coin', phone: '+33 1 23 45', website: null, rating: 4.5 },
  { name: 'A, B & Co "Ltd"', phone: null, website: 'https://ab.co', rating: 3 },
];
const columns = ['name', 'phone', 'website', 'rating'];

describe('serialize', () => {
  it('produces JSON', () => {
    const out = serialize(leads, 'json', columns);
    expect(JSON.parse(out)).toEqual(leads);
  });

  it('produces NDJSON (one object per line)', () => {
    const out = serialize(leads, 'ndjson', columns);
    const lines = out.split('\n');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!).name).toBe('Café du Coin');
  });

  it('produces CSV with a header and escaped cells', () => {
    const out = serialize(leads, 'csv', columns);
    const lines = out.split('\n');
    expect(lines[0]).toBe('name,phone,website,rating');
    // commas and quotes escaped; null becomes empty
    expect(lines[2]).toBe('"A, B & Co ""Ltd""",,https://ab.co,3');
  });
});
