import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Command } from 'commander';
import { loadConfig, type ExportFormat } from '../core/config.js';
import { contactToRow, enrichLead } from '../core/contact.js';
import { mergeLeads, parseDataset, type DatasetFormat } from '../core/dataset.js';
import { serialize } from '../core/export.js';
import { parseProxyList, ProxyRotator } from '../core/proxy.js';
import type { Lead, Value } from '../core/types.js';
import { log } from '../util/logger.js';

interface ContactsOptions {
  in?: string;
  out?: string;
  append?: string;
  format?: string;
  concurrency: string;
  pages: string;
  timeout: string;
  proxy?: string;
  proxiesFile?: string;
}

const FORMATS: ExportFormat[] = ['json', 'csv', 'ndjson'];
const COLUMNS = [
  'name',
  'owner',
  'email',
  'emails',
  'phone',
  'website',
  'facebook',
  'instagram',
  'linkedin',
  'twitter',
  'youtube',
];

export function registerContactsCommand(program: Command): void {
  program
    .command('contacts')
    .description('Turn a leads dataset into contacts: find emails, phones and the owner')
    .requiredOption('-i, --in <file>', 'leads dataset to enrich (json or ndjson)')
    .option('-o, --out <file>', 'write to a file (overwrites); format inferred from extension')
    .option('-a, --append <file>', 'append to a contacts file, de-duplicated (json or ndjson)')
    .option('--format <fmt>', 'json | csv | ndjson')
    .option('-c, --concurrency <n>', 'how many sites to scrape at once', '6')
    .option('--pages <n>', 'extra contact/about/team pages to scan per site', '3')
    .option('--timeout <ms>', 'per-request timeout in milliseconds', '12000')
    .option('--proxy <url>', 'route requests through one HTTP(S) proxy')
    .option('--proxies-file <file>', 'rotate through proxies listed in a file (one per line)')
    .addHelpText(
      'after',
      '\nExamples:\n' +
        '  $ leadjet find "restaurants" --city Lyon --country FR -o leads.ndjson\n' +
        '  $ leadjet contacts --in leads.ndjson -o contacts.csv\n',
    )
    .action(async (options: ContactsOptions) => {
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
        log.error('--append supports json or ndjson (CSV cannot be safely merged).');
        process.exitCode = 1;
        return;
      }

      if (!existsSync(options.in!)) {
        log.error(`Input file not found: ${options.in}`);
        process.exitCode = 1;
        return;
      }
      let leads: Lead[];
      try {
        leads = parseDataset(readFileSync(options.in!, 'utf8'), inputFormat(options.in!));
      } catch (err) {
        log.error(`Could not read leads from ${options.in}: ${errMsg(err)}`);
        process.exitCode = 1;
        return;
      }
      if (leads.length === 0) {
        log.error('No leads found in the input file.');
        process.exitCode = 1;
        return;
      }

      const proxyUrls = resolveProxies(options, config);
      const proxies = proxyUrls.length ? new ProxyRotator(proxyUrls) : undefined;
      const concurrency = clamp(options.concurrency, 6, 1, 32);
      const maxPages = clamp(options.pages, 3, 0, 10);
      const timeout = clamp(options.timeout, 12_000, 1000, 60_000);

      const withSite = leads.filter((l) => typeof l['website'] === 'string' && l['website']).length;
      log.info(
        `Enriching ${log.bold(String(leads.length))} lead(s) ` +
          `(${withSite} with a website)${proxies ? `, via ${proxyUrls.length} prox${proxyUrls.length === 1 ? 'y' : 'ies'}` : ''} …`,
      );

      let done = 0;
      let withOwner = 0;
      let withEmail = 0;
      let rows: Record<string, Value>[];
      try {
        rows = await mapPool(leads, concurrency, async (lead) => {
          const contact = await enrichLead(lead, {
            maxPages,
            timeout,
            ...(proxies ? { proxies } : {}),
          });
          done += 1;
          if (contact.owner) withOwner += 1;
          if (contact.emails.length) withEmail += 1;
          if (done % 10 === 0 || done === leads.length) {
            log.info(log.dim(`  ${done}/${leads.length} scanned …`));
          }
          return contactToRow(contact);
        });
      } finally {
        await proxies?.close();
      }

      if (options.append) {
        const existing = existsSync(options.append)
          ? parseDataset(readFileSync(options.append, 'utf8'), format as DatasetFormat)
          : [];
        const { merged, added } = mergeLeads(existing, rows);
        writeFileSync(options.append, `${serialize(merged, format, COLUMNS)}\n`);
        log.success(
          `Added ${added} contact(s) — ${merged.length} total in ${log.bold(options.append)}.`,
        );
      } else if (options.out) {
        writeFileSync(options.out, `${serialize(rows, format, COLUMNS)}\n`);
        log.success(`Wrote ${rows.length} contact(s) to ${log.bold(options.out)}.`);
      } else {
        process.stdout.write(`${serialize(rows, format, COLUMNS)}\n`);
      }
      log.success(`${withEmail} with an email, ${withOwner} with an owner name.`);
    });
}

/** Run `fn` over items with at most `size` in flight, preserving order. */
async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

function inputFormat(file: string): DatasetFormat {
  return file.endsWith('.json') ? 'json' : 'ndjson';
}

function resolveProxies(options: ContactsOptions, config: { proxies?: string[] }): string[] {
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

function clamp(raw: string, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
