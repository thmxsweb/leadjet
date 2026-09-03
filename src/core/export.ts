import type { ExportFormat } from './config.js';
import type { Lead } from './types.js';

/** Serialize leads to the requested format. `columns` sets CSV column order. */
export function serialize(leads: Lead[], format: ExportFormat, columns: string[]): string {
  switch (format) {
    case 'json':
      return JSON.stringify(leads, null, 2);
    case 'ndjson':
      return leads.map((l) => JSON.stringify(l)).join('\n');
    case 'csv':
      return toCsv(leads, columns);
  }
}

function toCsv(leads: Lead[], columns: string[]): string {
  const header = columns.map(csvCell).join(',');
  const rows = leads.map((lead) => columns.map((col) => csvCell(lead[col] ?? '')).join(','));
  return [header, ...rows].join('\n');
}

function csvCell(value: string | number | boolean | null): string {
  const text = value === null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
