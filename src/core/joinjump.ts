import { JumpClient } from '@thmxsweb/jj-sdk';
import type { EnrichedLead } from './pipeline.js';

/** Minimal shape of a Join-Jump client we rely on. */
interface JumpClientRecord {
  id?: string;
  type?: string;
  first_name?: string | null;
  last_name?: string | null;
  label?: string | null;
  siret?: string | null;
}

export interface ExportResultItem {
  name: string;
  status: 'created' | 'already-client' | 'error';
  clientId?: string;
  message?: string;
}

export interface ExportOutcome {
  toCreate: number;
  alreadyClients: number;
  created: ExportResultItem[];
  skipped: ExportResultItem[];
  errors: ExportResultItem[];
}

const norm = (s: string): string =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function jump(email: string, password: string): JumpClient {
  return new JumpClient({ email, password });
}

/** Fetch all existing clients on the account. */
export async function listClients(email: string, password: string): Promise<JumpClientRecord[]> {
  const svc = jump(email, password).missions;
  const res = (await svc.searchClients({})) as { clients?: JumpClientRecord[] };
  return res.clients ?? [];
}

/** Build the set of match keys (name + siret) for the existing clients. */
function clientKeys(clients: JumpClientRecord[]): Set<string> {
  const keys = new Set<string>();
  for (const c of clients) {
    const label = c.label ?? `${c.first_name ?? ''} ${c.last_name ?? ''}`;
    const n = norm(label);
    if (n) keys.add(`n:${n}`);
    if (c.siret) keys.add(`s:${c.siret}`);
  }
  return keys;
}

/** Is this lead already a client (by company name or SIRET)? */
function isExisting(lead: EnrichedLead, keys: Set<string>): boolean {
  const nameKey = `n:${norm(String(lead.legal || lead.name))}`;
  const altKey = `n:${norm(String(lead.name))}`;
  const siret = String(lead.siren || '');
  return keys.has(nameKey) || keys.has(altKey) || (siret !== '' && keys.has(`s:${siret}`));
}

function streetOf(lead: EnrichedLead): string {
  const loc = String(lead.location || '');
  const city = String(lead.regCity || '');
  const cp = String(lead.regCp || '');
  return loc
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && p !== city && p !== cp)
    .join(', ');
}

/** Map a lead to a Join-Jump "enterprise" client creation body. */
export function leadToClientBody(lead: EnrichedLead): Record<string, unknown> {
  const label = String(lead.legal || lead.name);
  const body: Record<string, unknown> = {
    type: 'enterprise',
    label,
    address: {
      country: 'FR',
      street: streetOf(lead),
      city: String(lead.regCity || ''),
      zip_code: String(lead.regCp || ''),
    },
  };
  return body;
}

/**
 * Match leads against existing clients, then optionally create the new ones.
 * With `confirm=false` this is a dry run: nothing is written, only the plan.
 */
export async function exportLeads(
  email: string,
  password: string,
  leads: EnrichedLead[],
  confirm: boolean,
): Promise<ExportOutcome> {
  const client = jump(email, password);
  const existing = (await client.missions.searchClients({})) as { clients?: JumpClientRecord[] };
  const keys = clientKeys(existing.clients ?? []);

  const skipped: ExportResultItem[] = [];
  const fresh: EnrichedLead[] = [];
  for (const lead of leads) {
    if (isExisting(lead, keys)) {
      skipped.push({ name: String(lead.name), status: 'already-client' });
    } else {
      fresh.push(lead);
    }
  }

  const created: ExportResultItem[] = [];
  const errors: ExportResultItem[] = [];
  if (confirm) {
    for (const lead of fresh) {
      try {
        const c = (await client.missions.createClient(leadToClientBody(lead))) as { id?: string };
        created.push({
          name: String(lead.name),
          status: 'created',
          ...(c.id ? { clientId: c.id } : {}),
        });
      } catch (err) {
        errors.push({
          name: String(lead.name),
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return {
    toCreate: fresh.length,
    alreadyClients: skipped.length,
    created,
    skipped,
    errors,
  };
}
