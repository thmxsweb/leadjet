import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { getAppId, isConfigKey, loadConfig, saveConfig, setConfigValue } from '../core/config.js';
import { exportLeads, listClients } from '../core/joinjump.js';
import { placesQuery, type Location } from '../core/location.js';
import { runPipeline, type EnrichedLead } from '../core/pipeline.js';
import { ProxyRotator } from '../core/proxy.js';
import { APP_JS, PAGE } from './ui.js';

interface SearchBody {
  source?: string;
  term?: string;
  city?: string;
  region?: string;
  country?: string;
  limit?: number;
  category?: string;
  owner?: boolean;
  audit?: boolean;
}

export function startServer(port: number, host: string): Server {
  const server = createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain' });
      res.end(`error: ${err instanceof Error ? err.message : String(err)}`);
    });
  });
  server.listen(port, host);
  return server;
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? '/';
  // Allow a separate frontend (e.g. the Next.js app) to call this local API.
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(PAGE);
    return;
  }
  if (req.method === 'GET' && url === '/app.js') {
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    res.end(APP_JS);
    return;
  }
  if (req.method === 'POST' && url === '/api/search') {
    await search(req, res);
    return;
  }
  if (req.method === 'GET' && url === '/api/config') {
    getConfig(res);
    return;
  }
  if (req.method === 'POST' && url === '/api/config') {
    await postConfig(req, res);
    return;
  }
  if (req.method === 'POST' && url === '/api/joinjump/test') {
    await joinjumpTest(res);
    return;
  }
  if (req.method === 'POST' && url === '/api/joinjump/export') {
    await joinjumpExport(req, res);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
}

/** Verify the Join-Jump credentials by connecting and counting clients. */
async function joinjumpTest(res: ServerResponse): Promise<void> {
  const c = loadConfig();
  if (!c.jumpEmail || !c.jumpPassword) {
    json(res, 200, { ok: false, error: 'Identifiants Join-Jump manquants.' });
    return;
  }
  try {
    const clients = await listClients(c.jumpEmail, c.jumpPassword);
    json(res, 200, { ok: true, count: clients.length });
  } catch (err) {
    json(res, 200, { ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}

/** Export selected leads as Join-Jump clients. `confirm=false` is a dry run. */
async function joinjumpExport(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = (await readBody(req)) as { leads?: EnrichedLead[]; confirm?: boolean };
  const c = loadConfig();
  if (!c.jumpEmail || !c.jumpPassword) {
    json(res, 200, { error: 'Connecte ton compte Join-Jump dans les Réglages.' });
    return;
  }
  const leads = Array.isArray(body.leads) ? body.leads : [];
  if (!leads.length) {
    json(res, 200, { error: 'Aucun lead sélectionné.' });
    return;
  }
  try {
    const outcome = await exportLeads(c.jumpEmail, c.jumpPassword, leads, body.confirm === true);
    json(res, 200, outcome);
  } catch (err) {
    json(res, 200, { error: err instanceof Error ? err.message : String(err) });
  }
}

/** Report which settings are present (never leaks the raw key). */
function getConfig(res: ServerResponse): void {
  const c = loadConfig();
  json(res, 200, {
    hasPlacesKey: Boolean(c.placesKey),
    keyHint: c.placesKey ? `${c.placesKey.slice(0, 4)}…${c.placesKey.slice(-4)}` : '',
    defaults: {
      source: c.source ?? '',
      country: c.country ?? '',
      region: c.region ?? '',
      city: c.city ?? '',
      language: c.language ?? '',
    },
    jump: {
      configured: Boolean(c.jumpEmail && c.jumpPassword),
      email: c.jumpEmail ?? '',
    },
    cvcrush: { appId: getAppId() },
  });
}

/** Save settings from the dashboard (Places key, default location, etc.). */
async function postConfig(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = (await readBody(req)) as Record<string, string>;
  let config = loadConfig();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue;
    if (key === 'places-key' && value.trim() === '') {
      const { placesKey: _drop, ...rest } = config;
      config = rest;
      continue;
    }
    if (isConfigKey(key)) config = setConfigValue(config, key, value);
  }
  try {
    saveConfig(config);
    getConfig(res);
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : String(err) });
  }
}

function json(res: ServerResponse, status: number, obj: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

async function search(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJson(req);
  res.writeHead(200, {
    'content-type': 'application/x-ndjson; charset=utf-8',
    'cache-control': 'no-cache',
    'x-accel-buffering': 'no',
  });
  const write = (obj: unknown): void => {
    res.write(`${JSON.stringify(obj)}\n`);
  };

  const config = loadConfig();
  const source = body.source === 'places' ? 'places' : 'osm';
  const location: Location = {
    ...(body.country ? { country: body.country } : {}),
    ...(body.region ? { region: body.region } : {}),
    ...(body.city ? { city: body.city } : {}),
  };
  const term = String(body.term ?? '').trim();
  const limit = Math.max(1, Math.min(Number(body.limit) || 30, 200));
  const proxyUrls = config.proxies ?? [];
  const proxies = proxyUrls.length ? new ProxyRotator(proxyUrls) : undefined;

  try {
    if (!term) throw new Error('Indique une niche à rechercher.');
    if (source === 'places' && !config.placesKey) {
      throw new Error(
        'Aucune clé Google Places. Utilise la source OpenStreetMap (gratuite) ou ajoute une clé via "leadjet config set places-key".',
      );
    }
    await runPipeline({
      source,
      term: source === 'places' ? placesQuery(term, location) : term,
      location,
      limit,
      enrichOwner: body.owner !== false,
      auditSites: body.audit !== false,
      ...(body.category ? { category: body.category } : {}),
      ...(source === 'places' && config.placesKey ? { key: config.placesKey } : {}),
      ...(config.language ? { language: config.language } : {}),
      ...(proxies ? { proxies } : {}),
      concurrency: 5,
      onLead: (lead: EnrichedLead) => write({ t: 'lead', lead }),
      onProgress: (done, total) => {
        if (done === 1) write({ t: 'meta', total });
      },
    });
    write({ t: 'done' });
  } catch (err) {
    write({ t: 'error', message: err instanceof Error ? err.message : String(err) });
  } finally {
    await proxies?.close();
    res.end();
  }
}

function readJson(req: IncomingMessage): Promise<SearchBody> {
  return readBody(req) as Promise<SearchBody>;
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}
