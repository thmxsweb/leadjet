import { describe, expect, it } from 'vitest';
import { leadKey, mergeLeads, parseDataset } from '../src/core/dataset';
import type { Lead } from '../src/core/types';

describe('leadKey', () => {
  it('uses place_id when present', () => {
    expect(leadKey({ place_id: 'abc', name: 'X' })).toBe('id:abc');
  });
  it('falls back to normalized name + address', () => {
    expect(leadKey({ name: 'Café  ', address: 'Rue X' })).toBe('na:café|rue x');
  });
});

describe('parseDataset', () => {
  it('parses ndjson', () => {
    const leads = parseDataset('{"name":"A"}\n{"name":"B"}\n', 'ndjson');
    expect(leads.map((l) => l.name)).toEqual(['A', 'B']);
  });
  it('parses a json array', () => {
    expect(parseDataset('[{"name":"A"}]', 'json')).toEqual([{ name: 'A' }]);
  });
  it('returns [] for empty content', () => {
    expect(parseDataset('   ', 'ndjson')).toEqual([]);
  });
});

describe('mergeLeads', () => {
  it('adds only new leads, keeping existing on collision', () => {
    const existing: Lead[] = [{ place_id: '1', name: 'Old' }];
    const incoming: Lead[] = [
      { place_id: '1', name: 'Dup' }, // same id -> skipped
      { place_id: '2', name: 'New' },
    ];
    const { merged, added } = mergeLeads(existing, incoming);
    expect(added).toBe(1);
    expect(merged).toHaveLength(2);
    expect(merged.find((l) => l.place_id === '1')?.name).toBe('Old');
  });

  it('dedupes by name+address when no place_id', () => {
    const { added } = mergeLeads([{ name: 'A', address: 'X' }], [{ name: 'a', address: 'x' }]);
    expect(added).toBe(0);
  });
});
