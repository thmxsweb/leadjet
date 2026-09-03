import type { Lead } from './types.js';

/** Formats that support appending/merging into a growing dataset. */
export type DatasetFormat = 'json' | 'ndjson';

/**
 * Stable de-duplication key for a lead: the Google Place ID when available,
 * otherwise a normalized name + address.
 */
export function leadKey(lead: Lead): string {
  const id = lead.place_id;
  if (typeof id === 'string' && id.length > 0) return `id:${id}`;
  const name = String(lead.name ?? '')
    .toLowerCase()
    .trim();
  const address = String(lead.address ?? '')
    .toLowerCase()
    .trim();
  return `na:${name}|${address}`;
}

/** Parse an existing dataset file's contents into leads. */
export function parseDataset(content: string, format: DatasetFormat): Lead[] {
  if (!content.trim()) return [];
  if (format === 'ndjson') {
    return content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as Lead);
  }
  const data = JSON.parse(content) as unknown;
  return Array.isArray(data) ? (data as Lead[]) : [];
}

/**
 * Merge incoming leads into an existing set, skipping duplicates (existing
 * entries win). Returns the merged list and how many were newly added.
 */
export function mergeLeads(existing: Lead[], incoming: Lead[]): { merged: Lead[]; added: number } {
  const byKey = new Map<string, Lead>();
  for (const lead of existing) byKey.set(leadKey(lead), lead);
  let added = 0;
  for (const lead of incoming) {
    const key = leadKey(lead);
    if (!byKey.has(key)) {
      byKey.set(key, lead);
      added += 1;
    }
  }
  return { merged: [...byKey.values()], added };
}
