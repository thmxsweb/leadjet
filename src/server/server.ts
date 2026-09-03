import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { loadConfig } from '../core/config.js';
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
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
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
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? (JSON.parse(raw) as SearchBody) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}
