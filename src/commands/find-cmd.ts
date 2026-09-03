import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Command } from 'commander';
import { loadConfig, type ExportFormat } from '../core/config.js';
import { mergeLeads, parseDataset, type DatasetFormat } from '../core/dataset.js';
import { serialize } from '../core/export.js';
import {
  buildFieldMask,
  DEFAULT_FIELDS,
  placeToLead,
  resolveFields,
  type FieldDef,
} from '../core/fields.js';
import { PlacesError, searchText } from '../core/places.js';
import { parseProxyList, ProxyRotator } from '../core/proxy.js';
import { log } from '../util/logger.js';

interface FindOptions {
  fields?: string;
  limit: string;
  out?: string;
  append?: string;
  format?: string;
  region?: string;
  language?: string;
  key?: string;
  proxy?: string;
  proxiesFile?: string;
}

const FORMATS: ExportFormat[] = ['json', 'csv', 'ndjson'];

export function registerFindCommand(program: Command): void {
  program
    .command('find <query...>')
    .description('Find leads from Google Places and export them')
    .option('-f, --fields <list>', 'comma-separated fields to export (see "leadjet fields")')
    .option('-l, --limit <n>', 'maximum number of leads', '20')
    .option('-o, --out <file>', 'write to a file (overwrites); format inferred from extension')
    .option('-a, --append <file>', 'append to a dataset file, de-duplicated (json or ndjson)')
    .option('--format <fmt>', 'json | csv | ndjson')
    .option('--region <code>', 'ISO region code to bias results, e.g. FR, CA')
    .option('--language <code>', 'language code, e.g. fr, en')
    .option('--key <key>', 'Google Places API key (overrides the saved one)')
    .option('--proxy <url>', 'route requests through one HTTP(S) proxy')
    .option('--proxies-file <file>', 'rotate through proxies listed in a file (one per line)')
    .addHelpText(
      'after',
      '\nExamples:\n' +
        '  $ leadjet find "plumbers in Bordeaux" --fields name,phone,website --limit 40\n' +
        '  $ leadjet find "hair salons in Montreal" -o leads.csv\n' +
        '  $ leadjet find "bakeries in Lyon" --append leads.ndjson   # grows a deduped dataset\n',
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

      const target = options.append ?? options.out;
      const format = resolveFormat(
        options.format ?? config.format,
        target,
        options.append ? 'ndjson' : 'json',
      );
      if (!format) {
        log.error(`Invalid --format. Use one of: ${FORMATS.join(', ')}`);
        process.exitCode = 1;
        return;
      }
      if (options.append && format === 'csv') {
        log.error('--append supports json or ndjson (CSV cannot be safely merged).');
        process.exitCode = 1;
        return;
      }

      let defs: FieldDef[];
      try {
        defs = resolveFields(
          options.fields ? options.fields.split(',') : (config.fields ?? DEFAULT_FIELDS),
        );
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
        return;
      }
      // A stable key is required to de-duplicate an appended dataset.
      if (options.append && !defs.some((d) => d.name === 'place_id')) {
        defs = [...defs, ...resolveFields(['place_id'])];
      }

      const limit = clampLimit(options.limit);
      const query = queryParts.join(' ');
      const region = options.region ?? config.region;
      const language = options.language ?? config.language;

      const proxyUrls = resolveProxies(options, config);
      const proxies = proxyUrls.length ? new ProxyRotator(proxyUrls) : undefined;
      if (proxies) {
        log.info(
          log.dim(
            `Routing through ${proxyUrls.length} prox${proxyUrls.length === 1 ? 'y' : 'ies'}.`,
          ),
        );
      }

      log.info(`Searching Google Places for ${log.bold(query)} …`);
      try {
        const places = await searchText({
          key,
          query,
          fieldMask: buildFieldMask(defs),
          limit,
          ...(region ? { region } : {}),
          ...(language ? { language } : {}),
          ...(proxies ? { proxies } : {}),
        });
        const found = places.map((p) => placeToLead(p, defs));
        const columns = defs.map((d) => d.name);

        if (options.append) {
          const existing = existsSync(options.append)
            ? parseDataset(readFileSync(options.append, 'utf8'), format as DatasetFormat)
            : [];
          const { merged, added } = mergeLeads(existing, found);
          writeFileSync(options.append, `${serialize(merged, format, columns)}\n`);
          log.success(
            `Added ${added} new lead(s) — ${merged.length} total in ${log.bold(options.append)}.`,
          );
        } else if (options.out) {
          writeFileSync(options.out, `${serialize(found, format, columns)}\n`);
          log.success(`Exported ${found.length} lead(s) to ${log.bold(options.out)}.`);
        } else {
          process.stdout.write(`${serialize(found, format, columns)}\n`);
          log.success(`Found ${found.length} lead(s).`);
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
      } finally {
        await proxies?.close();
      }
    });
}

function resolveProxies(options: FindOptions, config: { proxies?: string[] }): string[] {
  if (options.proxy) return [options.proxy];
  if (options.proxiesFile) return parseProxyList(readFileSync(options.proxiesFile, 'utf8'));
  return config.proxies ?? [];
}

function resolveFormat(
  explicit: string | undefined,
  target: string | undefined,
  fallback: ExportFormat,
): ExportFormat | null {
  const candidate = explicit ?? inferFromExtension(target) ?? fallback;
  return (FORMATS as string[]).includes(candidate) ? (candidate as ExportFormat) : null;
}

function inferFromExtension(target: string | undefined): ExportFormat | undefined {
  if (!target) return undefined;
  if (target.endsWith('.csv')) return 'csv';
  if (target.endsWith('.ndjson')) return 'ndjson';
  if (target.endsWith('.json')) return 'json';
  return undefined;
}

function clampLimit(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 20;
  return Math.min(n, 200);
}
