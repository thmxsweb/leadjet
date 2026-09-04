import { createInterface } from 'node:readline';
import { DEFAULT_WEB_URL, me, pushLeads } from './cli-link.js';
import { loadConfig } from './config.js';
import { type Location } from './location.js';
import { runPipeline } from './pipeline.js';
import { VERSION } from '../version.js';

/**
 * A minimal MCP server over stdio (newline-delimited JSON-RPC 2.0) — no deps, so
 * it bundles cleanly into the single-file CLI + standalone binaries.
 * Every data tool is gated on the CLI being linked to a leadjet-web account.
 */

const PROTOCOL = '2024-11-05';

interface Rpc {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
}

// IMPORTANT: only JSON-RPC frames go to stdout; everything else must use stderr.
function send(msg: unknown): void {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}
function ok(id: Rpc['id'], result: unknown): void {
  send({ jsonrpc: '2.0', id, result });
}
function fail(id: Rpc['id'], code: number, message: string): void {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

const TOOLS = [
  {
    name: 'account_status',
    description: 'Check whether the leadjet CLI is linked to a leadjet-web account.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'search_leads',
    description:
      'Find, enrich (owner + website audit) and score local business leads, and push them to the linked leadjet-web account. Returns the scored leads.',
    inputSchema: {
      type: 'object',
      properties: {
        niche: { type: 'string', description: 'e.g. restaurants, plumbers, coiffeurs' },
        city: { type: 'string' },
        country: { type: 'string' },
        region: { type: 'string' },
        source: { type: 'string', enum: ['osm', 'places'], description: 'osm (free) or places' },
        limit: { type: 'number', description: 'max leads (default 20, up to 100)' },
        push: { type: 'boolean', description: 'push results to the account (default true)' },
      },
      required: ['niche', 'city'],
    },
  },
];

async function linkedAccount(): Promise<{ web: string; token: string; email: string } | null> {
  const c = loadConfig();
  if (!c.linkToken) return null;
  const web = (c.webUrl ?? DEFAULT_WEB_URL).replace(/\/+$/, '');
  const info = await me(web, c.linkToken);
  return info ? { web, token: c.linkToken, email: info.email } : null;
}

const NOT_LINKED =
  'The leadjet CLI is not linked to a leadjet-web account (or the link expired). ' +
  'Ask the user to run "leadjet link" in their terminal and approve it at ' +
  'https://leadjet-web.vercel.app, then retry.';

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === 'account_status') {
    const l = await linkedAccount();
    return { content: [{ type: 'text', text: l ? `Linked to ${l.email}.` : NOT_LINKED }] };
  }
  if (name === 'search_leads') {
    const l = await linkedAccount();
    if (!l) return { content: [{ type: 'text', text: NOT_LINKED }], isError: true };
    const location: Location = {
      ...(args.city ? { city: String(args.city) } : {}),
      ...(args.region ? { region: String(args.region) } : {}),
      ...(args.country ? { country: String(args.country) } : {}),
    };
    const leads = await runPipeline({
      source: args.source === 'places' ? 'places' : 'osm',
      term: String(args.niche ?? ''),
      location,
      limit: Math.min(Number(args.limit) || 20, 100),
      enrichOwner: true,
      auditSites: true,
      concurrency: 5,
    });
    leads.sort((a, b) => b.score - a.score);
    let pushed = '';
    if (args.push !== false) {
      const r = await pushLeads(l.web, l.token, leads);
      pushed = ` Pushed ${r.added} new (${r.total} total) to ${l.email}.`;
    }
    return {
      content: [
        {
          type: 'text',
          text: `Found ${leads.length} leads for "${String(args.niche)}" in ${String(args.city)}.${pushed}\n\n${JSON.stringify(leads.slice(0, 50), null, 2)}`,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${name}`);
}

/** Run the MCP server, reading JSON-RPC from stdin and writing to stdout. */
export async function runMcp(): Promise<void> {
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    const text = line.trim();
    if (!text) continue;
    let msg: Rpc;
    try {
      msg = JSON.parse(text) as Rpc;
    } catch {
      continue;
    }
    const { id, method, params } = msg;
    try {
      if (method === 'initialize') {
        ok(id, {
          protocolVersion: PROTOCOL,
          capabilities: { tools: {} },
          serverInfo: { name: 'leadjet', version: VERSION },
        });
      } else if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
        // notifications: no response
      } else if (method === 'ping') {
        ok(id, {});
      } else if (method === 'tools/list') {
        ok(id, { tools: TOOLS });
      } else if (method === 'tools/call') {
        const p = (params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
        ok(id, await callTool(String(p.name), p.arguments ?? {}));
      } else if (id !== undefined) {
        fail(id, -32601, `Method not found: ${method ?? ''}`);
      }
    } catch (err) {
      if (id !== undefined) fail(id, -32000, err instanceof Error ? err.message : String(err));
    }
  }
}
