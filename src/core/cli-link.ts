import type { EnrichedLead } from './pipeline.js';

export const DEFAULT_WEB_URL = 'https://leadjet-web.vercel.app';

/** Check the current link: returns the account email + expiry, or null if invalid. */
export async function me(
  webUrl: string,
  token: string,
): Promise<{ email: string; expiresAt: string } | null> {
  try {
    const res = await fetch(`${webUrl}/api/cli/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as { email: string; expiresAt: string };
  } catch {
    return null;
  }
}

export interface LinkStart {
  code: string;
  deviceSecret: string;
  verifyUrl: string;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Begin device pairing: returns the code + approval URL. */
export async function startLink(webUrl: string, label?: string): Promise<LinkStart> {
  const res = await fetch(`${webUrl}/api/cli/link`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) throw new Error(`Could not reach leadjet-web at ${webUrl} (${res.status}).`);
  return (await res.json()) as LinkStart;
}

/** Poll until the user approves, then return the 7-day token. */
export async function pollToken(
  webUrl: string,
  code: string,
  deviceSecret: string,
  timeoutMs = 5 * 60 * 1000,
  onWait?: () => void,
): Promise<{ token: string; expiresAt: string }> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const res = await fetch(`${webUrl}/api/cli/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, deviceSecret }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      status?: string;
      token?: string;
      expiresAt?: string;
    };
    if (res.status === 410 || data.status === 'expired') {
      throw new Error('Pairing expired. Run "leadjet link" again.');
    }
    if (data.status === 'approved' && data.token) {
      return { token: data.token, expiresAt: data.expiresAt ?? '' };
    }
    if (Date.now() > deadline) throw new Error('Timed out waiting for approval.');
    onWait?.();
    await sleep(2500);
  }
}

/** Push enriched leads to the linked account. */
export async function pushLeads(
  webUrl: string,
  token: string,
  leads: EnrichedLead[],
): Promise<{ added: number; updated: number; total: number }> {
  const res = await fetch(`${webUrl}/api/leads`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ leads }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    added?: number;
    updated?: number;
    total?: number;
  };
  if (!res.ok) throw new Error(data.error ?? `Push failed (${res.status}).`);
  return { added: data.added ?? 0, updated: data.updated ?? 0, total: data.total ?? 0 };
}
