import { request, USER_AGENT } from './http.js';
import type { ProxyRotator } from './proxy.js';

/** Quality signals about an existing business website. */
export interface SiteAudit {
  reachable: boolean;
  https: boolean;
  mobile: boolean;
  builder: string;
  socialOnly: boolean;
  email: string;
}

const BUILDERS =
  /wixsite\.com|wix\.com|business\.site|sites\.google|e-monsite|pagesjaunes|weebly|jimdo|systeme\.io|wordpress\.com|over-blog|monsite|site123|godaddysites|webnode/i;
const SOCIAL_ONLY = /^https?:\/\/(?:www\.)?(?:facebook|instagram|linktr\.ee|linkedin)\.com/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const EMAIL_BAD =
  /(sentry|wixpress|example\.|@domain|@email|\.png|\.jpg|@2x|@3x|@ovh\.|zenchef|@wix\.|squarespace|cloudflare|godaddy)/i;

function bestEmail(html: string): string {
  const set = new Set<string>();
  const add = (raw: string): void => {
    const m = raw.toLowerCase().match(EMAIL_RE);
    if (!m) return;
    const e = m[0].replace(/[.,;:]+$/, '');
    if (e.length > 100 || EMAIL_BAD.test(e)) return;
    set.add(e);
  };
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) add(m[1] ?? '');
  for (const m of html.matchAll(EMAIL_RE)) add(m[0]);
  const rank = (e: string): number =>
    /^(no-?reply|donotreply)/.test(e) ? 3 : /^(info|contact|hello|bonjour|accueil)/.test(e) ? 1 : 0;
  return [...set].sort((a, b) => rank(a) - rank(b))[0] ?? '';
}

/** Fetch a business website and report web-quality signals (for lead scoring). */
export async function auditSite(
  website: string,
  proxies?: ProxyRotator,
  timeout = 12_000,
): Promise<SiteAudit> {
  const audit: SiteAudit = {
    reachable: false,
    https: false,
    mobile: false,
    builder: '',
    socialOnly: false,
    email: '',
  };
  const raw = website.trim();
  if (!raw) return audit;
  if (SOCIAL_ONLY.test(raw)) {
    audit.socialOnly = true;
    return audit;
  }
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  audit.https = /^https:/i.test(url);
  try {
    const res = await request(
      url,
      {
        headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
        signal: AbortSignal.timeout(timeout),
      },
      proxies,
    );
    audit.reachable = res.ok;
    audit.https = /^https:/i.test(res.url || url);
    const ctype = res.headers.get('content-type') ?? '';
    if (res.ok && /html|xml|text/i.test(ctype)) {
      const html = (await res.text()).slice(0, 1_500_000);
      audit.mobile = /<meta[^>]+name=["']viewport["']/i.test(html);
      audit.builder = (raw.match(BUILDERS) ?? html.match(BUILDERS) ?? [''])[0].toLowerCase();
      audit.email = bestEmail(html);
    }
  } catch {
    audit.reachable = false;
  }
  return audit;
}
