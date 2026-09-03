import type { AuditResult } from '../../shared/lead.js';

const UA = 'Leadjet/0.0.1 (+https://github.com/thmxsweb/leadjet)';

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Fetch a business website and score how much it needs help: unreachable, no
 * HTTPS, not mobile-friendly, or missing a title all raise the opportunity.
 */
export async function auditSite(rawUrl: string): Promise<AuditResult> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': UA, accept: 'text/html' },
    });
    const finalUrl = res.url || url;
    const html = (await res.text()).slice(0, 200_000);
    const https = finalUrl.startsWith('https:');
    const mobileFriendly = /<meta[^>]+name=["']viewport["']/i.test(html);
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '').trim() || null;
    const reachable = res.status < 500;

    const issues: string[] = [];
    if (!reachable) issues.push('Site returns a server error');
    if (!https) issues.push('No HTTPS');
    if (!mobileFriendly) issues.push('Not mobile-friendly (no viewport meta)');
    if (!title) issues.push('Missing page title');

    let score = 25;
    if (!reachable) score += 30;
    if (!https) score += 20;
    if (!mobileFriendly) score += 18;
    if (!title) score += 7;

    return {
      url: finalUrl,
      status: res.status,
      reachable,
      https,
      mobileFriendly,
      title,
      issues,
      score: Math.min(95, score),
    };
  } catch {
    return {
      url,
      status: null,
      reachable: false,
      https: false,
      mobileFriendly: false,
      title: null,
      issues: ['Site unreachable'],
      score: 88,
    };
  } finally {
    clearTimeout(timer);
  }
}
