import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Command } from 'commander';
import { DEFAULT_WEB_URL, pushLeads } from '../core/cli-link.js';
import { loadConfig, type Config, type ExportFormat } from '../core/config.js';
import { mergeLeads, parseDataset, type DatasetFormat } from '../core/dataset.js';
import { serialize } from '../core/export.js';
import { type Location } from '../core/location.js';
import { runPipeline, type EnrichedLead } from '../core/pipeline.js';
import { parseProxyList, ProxyRotator } from '../core/proxy.js';
import { log } from '../util/logger.js';

interface LeadsOptions {
  source?: string;
  country?: string;
  region?: string;
  city?: string;
  category?: string;
  limit: string;
  owner: boolean;
  audit: boolean;
  out?: string;
  append?: string;
  format?: string;
  push?: boolean;
  language?: string;
  key?: string;
  proxy?: string;
  proxiesFile?: string;
}

const FORMATS: ExportFormat[] = ['json', 'csv', 'ndjson'];

/** The columns exported by `leadjet leads`, in order. */
export const LEAD_COLUMNS = [
  'name',
  'legal',
  'activity',
  'owner',
  'role',
  'phone',
  'email',
  'score',
  'priority',
  'opportunity',
  'approach',
  'domain',
  'domainType',
  'location',
  'regCity',
  'regCp',
  'website',
  'siteStatus',
  'naf',
  'legalForm',
  'created',
  'size',
  'siren',
  'siret',
  'vat',
  'confidence',
  'source',
];

export function registerLeadsCommand(program: Command): void {
  program
    .command('leads <query...>')
    .description('Find, enrich (owner + site audit) and score leads in one go')
    .option('-s, --source <src>', 'places (Google, needs key) or osm (OpenStreetMap, free)')
    .option('--country <name>', 'target country, e.g. France, CA')
    .option('--region <name>', 'target region, e.g. Île-de-France, Quebec')
    .option('--city <name>', 'target city, e.g. Paris, Lyon')
    .option('--category <cat>', 'OSM category: any|shops|food|craft|services|beauty')
    .option('-l, --limit <n>', 'maximum number of leads', '30')
    .option('--no-owner', 'skip owner lookup (French registry)')
    .option('--no-audit', 'skip website audit')
    .option('-o, --out <file>', 'write to a file (overwrites); format inferred from extension')
    .option('-a, --append <file>', 'append to a dataset file, de-duplicated (json or ndjson)')
    .option('--push', 'push the found leads to your linked leadjet-web account')
    .option('--format <fmt>', 'json | csv | ndjson')
    .option('--language <code>', 'language code, e.g. fr, en')
    .option('--key <key>', 'Google Places API key (overrides the saved one)')
    .option('--proxy <url>', 'route requests through one HTTP(S) proxy')
    .option('--proxies-file <file>', 'rotate through proxies listed in a file')
    .addHelpText(
      'after',
      '\nExamples:\n' +
        '  $ leadjet leads "restaurants" --city Lyon --country France -o leads.csv\n' +
        '  $ leadjet leads "plombiers" --city Paris --region "Île-de-France" --no-audit\n',
    )
    .action(async (queryParts: string[], options: LeadsOptions) => {
      const config = loadConfig();
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
        log.error('--append supports json or ndjson.');
        process.exitCode = 1;
        return;
      }

      const term = queryParts.join(' ');
      const limit = clampLimit(options.limit);
      const location = resolveLocation(options, config);
      const key = options.key ?? config.placesKey;
      const source = (options.source ?? config.source ?? (key ? 'places' : 'osm')).toLowerCase();
      if (source !== 'places' && source !== 'osm') {
        log.error(`Invalid --source "${source}". Use "places" or "osm".`);
        process.exitCode = 1;
        return;
      }
      if (source === 'places' && !key) {
        log.error('No Google Places API key. Use --source osm (free) or set a key.');
        process.exitCode = 1;
        return;
      }

      const proxyUrls = resolveProxies(options, config);
      const proxies = proxyUrls.length ? new ProxyRotator(proxyUrls) : undefined;
      const language = options.language ?? config.language;

      log.info(
        `Finding ${log.bold(term)}${location.city ? ` in ${log.bold(location.city)}` : ''} …`,
      );
      try {
        const leads = await runPipeline({
          source,
          term,
          location,
          limit,
          enrichOwner: options.owner,
          auditSites: options.audit,
          ...(options.category ? { category: options.category } : {}),
          ...(source === 'places' && key ? { key } : {}),
          ...(language ? { language } : {}),
          ...(proxies ? { proxies } : {}),
          concurrency: 5,
          onProgress: (done, total) => {
            if (done % 5 === 0 || done === total)
              log.info(log.dim(`  enriched ${done}/${total} …`));
          },
        });
        leads.sort((a, b) => b.score - a.score);
        if (options.push) await pushToAccount(leads, config);
        if (options.out || options.append) writeOut(leads, format, options);
        else if (!options.push) writeOut(leads, format, options);
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
      } finally {
        await proxies?.close();
      }
    });
}

function writeOut(leads: EnrichedLead[], format: ExportFormat, options: LeadsOptions): void {
  if (options.append) {
    const existing = existsSync(options.append)
      ? parseDataset(readFileSync(options.append, 'utf8'), format as DatasetFormat)
      : [];
    const { merged, added } = mergeLeads(existing, leads);
    writeFileSync(options.append, `${serialize(merged, format, LEAD_COLUMNS)}\n`);
    log.success(
      `Added ${added} new lead(s) — ${merged.length} total in ${log.bold(options.append)}.`,
    );
  } else if (options.out) {
    writeFileSync(options.out, `${serialize(leads, format, LEAD_COLUMNS)}\n`);
    log.success(`Wrote ${leads.length} scored lead(s) to ${log.bold(options.out)}.`);
  } else {
    process.stdout.write(`${serialize(leads, format, LEAD_COLUMNS)}\n`);
    const hot = leads.filter((l) => l.priority === 'Chaud').length;
    log.success(`${leads.length} lead(s) — ${hot} Chaud.`);
  }
}

async function pushToAccount(leads: EnrichedLead[], config: Config): Promise<void> {
  if (!config.linkToken) {
    log.error('Not linked. Run "leadjet link" first.');
    return;
  }
  if (config.linkTokenExpires && new Date(config.linkTokenExpires).getTime() < Date.now()) {
    log.error('Your link expired (7 days). Run "leadjet link" again.');
    return;
  }
  const webUrl = (config.webUrl ?? DEFAULT_WEB_URL).replace(/\/+$/, '');
  log.info(`Pushing ${leads.length} lead(s) to ${log.bold(webUrl)} …`);
  const r = await pushLeads(webUrl, config.linkToken, leads);
  log.success(`Pushed: ${r.added} new, ${r.updated} updated — ${r.total} total in your account.`);
}

function resolveLocation(options: LeadsOptions, config: Config): Location {
  const country = options.country ?? config.country;
  const region = options.region ?? config.region;
  const city = options.city ?? config.city;
  return {
    ...(country ? { country } : {}),
    ...(region ? { region } : {}),
    ...(city ? { city } : {}),
  };
}

function resolveProxies(options: LeadsOptions, config: Config): string[] {
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
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(n, 200);
}
