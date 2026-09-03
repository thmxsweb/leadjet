import { request, USER_AGENT } from './http.js';
import type { ProxyRotator } from './proxy.js';
import type { Value } from './types.js';

/** A lead enriched with the people/ways to reach the business. */
export interface Contact {
  name: string | null;
  website: string | null;
  owner: string | null;
  emails: string[];
  phones: string[];
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
}

export interface EnrichOptions {
  /** Extra "contact/about/team" pages to fetch beyond the homepage. */
  maxPages?: number;
  /** Per-request timeout in ms. */
  timeout?: number;
  proxies?: ProxyRotator;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const MAILTO_RE = /mailto:([^"'?>\s]+)/gi;
const TEL_RE = /tel:([+\d][\d\s().-]{5,})/gi;

/** Domains/patterns that are never a real business contact. */
const EMAIL_BLOCKLIST =
  /(sentry|wixpress|example\.|your-?email|email@|@domain|@email|@sentry|\.png|\.jpg|\.gif|\.webp|\.svg|@2x|@3x|@sfdc|core-js|@babel|@types|@ovh\.|zenchef|@wix\.|squarespace|cloudflare|godaddy|urecommend|udevweb|@wordpress)/i;

/** Strict email pattern used to clean a candidate down to just the address. */
const EMAIL_STRICT = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/;

const SOCIALS: { key: keyof Contact; host: RegExp }[] = [
  { key: 'facebook', host: /(?:https?:)?\/\/(?:[\w.-]*\.)?facebook\.com\/[^"'\s?#]+/i },
  { key: 'instagram', host: /(?:https?:)?\/\/(?:[\w.-]*\.)?instagram\.com\/[^"'\s?#]+/i },
  { key: 'linkedin', host: /(?:https?:)?\/\/(?:[\w.-]*\.)?linkedin\.com\/[^"'\s?#]+/i },
  { key: 'twitter', host: /(?:https?:)?\/\/(?:[\w.-]*\.)?(?:twitter|x)\.com\/[^"'\s?#]+/i },
  { key: 'youtube', host: /(?:https?:)?\/\/(?:[\w.-]*\.)?youtube\.com\/[^"'\s?#]+/i },
];

/** Links whose text or href suggests a page with owner/contact info. */
const PAGE_HINTS =
  /(contact|about|about-us|team|equipe|équipe|notre-equipe|a-propos|à-propos|apropos|qui-sommes|mentions|legal|impressum|staff|leadership|founder|fondateur)/i;

/** Pull emails out of raw HTML, de-duplicated and cleaned. */
export function extractEmails(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(MAILTO_RE)) add(found, decodeURIComponent(m[1] ?? ''));
  for (const m of html.matchAll(EMAIL_RE)) add(found, m[0]);
  // Real contact addresses first, generic/no-reply last.
  return [...found].sort((a, b) => rank(a) - rank(b));
}

function add(set: Set<string>, raw: string): void {
  // Clean the candidate down to a valid address — a mailto without a closing
  // quote can drag in `</p`, `<br`, or a trailing `\`.
  const match = raw.trim().toLowerCase().match(EMAIL_STRICT);
  if (!match) return;
  const email = match[0].replace(/[.,;:]+$/, '');
  if (email.length > 100) return;
  if (EMAIL_BLOCKLIST.test(email)) return;
  set.add(email);
}

function rank(email: string): number {
  if (/^(no-?reply|donotreply|postmaster|mailer-daemon)/.test(email)) return 3;
  if (/^(info|contact|hello|bonjour|admin|support|sales|office)/.test(email)) return 1;
  return 0; // a named address like jean@… is the best bet for the owner
}

/** Pull phone numbers out of `tel:` links. */
export function extractPhones(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(TEL_RE)) {
    const phone = (m[1] ?? '').replace(/\s+/g, ' ').trim();
    if (phone) found.add(phone);
  }
  return [...found];
}

/** Find the first matching social profile URL for each network. */
export function extractSocials(html: string): Partial<Record<keyof Contact, string>> {
  const out: Partial<Record<keyof Contact, string>> = {};
  for (const { key, host } of SOCIALS) {
    const m = html.match(host);
    if (!m) continue;
    let url = m[0];
    if (url.startsWith('//')) url = `https:${url}`;
    // Skip bare share/intent links.
    if (/\/(sharer|share|intent|dialog)\b/i.test(url)) continue;
    out[key] = url;
  }
  return out;
}

/** Best-effort owner/founder name from JSON-LD or author metadata. */
export function extractOwner(html: string): string | null {
  for (const block of jsonLdBlocks(html)) {
    const name = ownerFromNode(block);
    if (name) return name;
  }
  const author = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  const name = author?.[1]?.trim();
  return name && !/^(wordpress|wix|squarespace|shopify|joomla)/i.test(name) ? name : null;
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      blocks.push(JSON.parse((m[1] ?? '').trim()));
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return blocks;
}

function ownerFromNode(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const name = ownerFromNode(n);
      if (name) return name;
    }
    return null;
  }
  if (!node || typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj['@graph'])) {
    const name = ownerFromNode(obj['@graph']);
    if (name) return name;
  }
  for (const rel of ['founder', 'owner', 'author']) {
    const name = personName(obj[rel]);
    if (name) return name;
  }
  const type = String(obj['@type'] ?? '');
  if (/Person/i.test(type)) {
    const name = personName(obj);
    if (name) return name;
  }
  return null;
}

function personName(node: unknown): string | null {
  if (typeof node === 'string') return node.trim() || null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const name = personName(n);
      if (name) return name;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    const name = (node as Record<string, unknown>)['name'];
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return null;
}

/** Discover up to `max` internal contact/about/team page URLs. */
export function discoverPages(html: string, base: string, max: number): string[] {
  let origin: URL;
  try {
    origin = new URL(base);
  } catch {
    return [];
  }
  const out = new Set<string>();
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(re)) {
    if (out.size >= max) break;
    const href = m[1] ?? '';
    const text = (m[2] ?? '').replace(/<[^>]+>/g, ' ');
    if (!PAGE_HINTS.test(href) && !PAGE_HINTS.test(text)) continue;
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const url = new URL(href, origin);
      if (url.hostname !== origin.hostname) continue;
      url.hash = '';
      if (url.href !== origin.href) out.add(url.href);
    } catch {
      /* skip bad href */
    }
  }
  return [...out];
}

async function fetchHtml(
  url: string,
  timeout: number,
  proxies?: ProxyRotator,
): Promise<string | null> {
  try {
    const res = await request(
      url,
      {
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(timeout),
      },
      proxies,
    );
    if (!res.ok) return null;
    const ctype = res.headers.get('content-type') ?? '';
    if (!/html|xml|text\/plain/i.test(ctype)) return null;
    const body = await res.text();
    return body.length > 3_000_000 ? body.slice(0, 3_000_000) : body;
  } catch {
    return null;
  }
}

function normalizeSite(website: Value): string | null {
  if (typeof website !== 'string' || !website.trim()) return null;
  const raw = website.trim();
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

/** Turn one lead (needs a `website`) into a Contact by scraping the site. */
export async function enrichLead(
  lead: Record<string, Value>,
  options: EnrichOptions = {},
): Promise<Contact> {
  const name = typeof lead['name'] === 'string' ? (lead['name'] as string) : null;
  const website = normalizeSite(lead['website'] ?? null);
  const contact: Contact = {
    name,
    website,
    owner: null,
    emails: [],
    phones: [],
    facebook: null,
    instagram: null,
    linkedin: null,
    twitter: null,
    youtube: null,
  };
  // Carry a phone the lead already had.
  if (typeof lead['phone'] === 'string' && lead['phone'].trim()) {
    contact.phones.push(lead['phone'].trim());
  }
  if (!website) return contact;

  const timeout = options.timeout ?? 12_000;
  const maxPages = options.maxPages ?? 3;

  const home = await fetchHtml(website, timeout, options.proxies);
  const pages: string[] = home ? discoverPages(home, website, maxPages) : [];
  const htmls = [
    home,
    ...(await Promise.all(pages.map((p) => fetchHtml(p, timeout, options.proxies)))),
  ];

  const emails = new Set<string>();
  const phones = new Set<string>(contact.phones);
  for (const html of htmls) {
    if (!html) continue;
    for (const e of extractEmails(html)) emails.add(e);
    for (const p of extractPhones(html)) phones.add(p);
    const socials = extractSocials(html);
    for (const k of ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'] as const) {
      if (!contact[k] && socials[k]) contact[k] = socials[k] ?? null;
    }
    if (!contact.owner) contact.owner = extractOwner(html);
  }
  contact.emails = [...emails].sort((a, b) => rank(a) - rank(b));
  contact.phones = [...phones];
  return contact;
}

/** Flatten a Contact to a Lead-style row for export. */
export function contactToRow(c: Contact): Record<string, Value> {
  return {
    name: c.name,
    owner: c.owner,
    email: c.emails[0] ?? null,
    emails: c.emails.join(' | ') || null,
    phone: c.phones[0] ?? null,
    website: c.website,
    facebook: c.facebook,
    instagram: c.instagram,
    linkedin: c.linkedin,
    twitter: c.twitter,
    youtube: c.youtube,
  };
}
