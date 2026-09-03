import { writeFileSync } from 'node:fs';
import type { Command } from 'commander';
import { loadConfig, type ExportFormat } from '../core/config.js';
import { serialize } from '../core/export.js';
import { buildFieldMask, DEFAULT_FIELDS, placeToLead, resolveFields } from '../core/fields.js';
import { PlacesError, searchText } from '../core/places.js';
import { log } from '../util/logger.js';

interface FindOptions {
  fields?: string;
  limit: string;
  out?: string;
  format?: string;
  region?: string;
  language?: string;
  key?: string;
}

const FORMATS: ExportFormat[] = ['json', 'csv', 'ndjson'];

export function registerFindCommand(program: Command): void {
  program
    .command('find <query...>')
    .description('Find leads from Google Places and export them')
    .option('-f, --fields <list>', 'comma-separated fields to export (see "leadjet fields")')
    .option('-l, --limit <n>', 'maximum number of leads', '20')
    .option('-o, --out <file>', 'write to a file instead of stdout')
    .option('--format <fmt>', 'json | csv | ndjson')
    .option('--region <code>', 'ISO region code to bias results, e.g. FR, CA')
    .option('--language <code>', 'language code, e.g. fr, en')
    .option('--key <key>', 'Google Places API key (overrides the saved one)')
    .addHelpText(
      'after',
      '\nExamples:\n' +
        '  $ leadjet find "plumbers in Bordeaux" --fields name,phone,website --limit 40\n' +
        '  $ leadjet find "hair salons in Montreal" -o leads.csv --format csv\n',
    )
    .action(async (queryParts: string[], options: FindOptions) => {
      const config = loadConfig();
      const key = options.key ?? config.placesKey;
      if (!key) {
        log.error('No Google Places API key set.');
        log.info(`Set it once with:  ${log.bold('leadjet config set places-key <YOUR_KEY>')}`);
        log.info(log.dim('Create a key in Google Cloud and enable the "Places API (New)".'));
        process.exitCode = 1;
        return;
      }

      let defs;
      try {
        defs = resolveFields(
          options.fields ? options.fields.split(',') : (config.fields ?? DEFAULT_FIELDS),
        );
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
        return;
      }

      const format = resolveFormat(options.format ?? config.format, options.out);
      if (!format) {
        log.error(`Invalid --format. Use one of: ${FORMATS.join(', ')}`);
        process.exitCode = 1;
        return;
      }

      const limit = clampLimit(options.limit);
      const query = queryParts.join(' ');

      log.info(`Searching Google Places for ${log.bold(query)} …`);
      try {
        const places = await searchText({
          key,
          query,
          fieldMask: buildFieldMask(defs),
          limit,
          ...((options.region ?? config.region) ? { region: options.region ?? config.region } : {}),
          ...((options.language ?? config.language)
            ? { language: options.language ?? config.language }
            : {}),
        });

        const leads = places.map((p) => placeToLead(p, defs));
        const output = serialize(
          leads,
          format,
          defs.map((d) => d.name),
        );

        if (options.out) {
          writeFileSync(options.out, `${output}\n`);
          log.success(`Exported ${leads.length} lead(s) to ${log.bold(options.out)}.`);
        } else {
          process.stdout.write(`${output}\n`);
          log.success(`Found ${leads.length} lead(s).`);
        }
      } catch (err) {
        if (err instanceof PlacesError) {
          log.error(err.message);
          if (err.status === 403) {
            log.info(log.dim('Check the key is valid and the "Places API (New)" is enabled.'));
          }
        } else {
          log.error(err instanceof Error ? err.message : String(err));
        }
        process.exitCode = 1;
      }
    });
}

function resolveFormat(explicit: string | undefined, out: string | undefined): ExportFormat | null {
  const candidate = explicit ?? inferFromExtension(out) ?? 'json';
  return (FORMATS as string[]).includes(candidate) ? (candidate as ExportFormat) : null;
}

function inferFromExtension(out: string | undefined): ExportFormat | undefined {
  if (!out) return undefined;
  if (out.endsWith('.csv')) return 'csv';
  if (out.endsWith('.ndjson')) return 'ndjson';
  if (out.endsWith('.json')) return 'json';
  return undefined;
}

function clampLimit(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 20;
  return Math.min(n, 200);
}
