import type { SiteAudit } from './audit.js';

export type Priority = 'Chaud' | 'Tiède' | 'Froid';

export interface ScoreInput {
  website: string;
  phone: string;
  email: string;
  owner: string;
  created: string;
  size: string;
  audit?: SiteAudit | null;
}

export interface ScoreResult {
  score: number;
  priority: Priority;
  opportunity: string;
  siteStatus: string;
  approach: string;
}

const YEAR = 2026;

/**
 * Score a lead 0-100 as a web-services prospect: web need + reachability + value.
 * Higher is a better prospect. Pure function — same input, same output.
 */
export function scoreLead(i: ScoreInput): ScoreResult {
  const a = i.audit ?? null;
  const hasSite = Boolean(i.website);

  let need: number;
  if (!hasSite) need = 60;
  else if (a?.socialOnly) need = 50;
  else if (a && !a.reachable) need = 55;
  else {
    need = 10;
    if (a?.builder) need = 35;
    if (a && !a.https) need += 10;
    if (a && !a.mobile) need += 10;
  }
  need = Math.min(need, 60);

  let reach = 0;
  if (i.phone) reach += 12;
  if (i.email) reach += 8;

  let value = 0;
  if (i.owner) value += 8;
  const age = i.created ? YEAR - Number(i.created) : 0;
  if (age > 3) value += 6;
  if (i.size && !/^0 /.test(i.size)) value += 6;

  const score = Math.min(100, need + reach + value);
  const priority: Priority = score >= 70 ? 'Chaud' : score >= 45 ? 'Tiède' : 'Froid';

  return {
    score,
    priority,
    opportunity: opportunity(hasSite, a),
    siteStatus: siteStatus(hasSite, a),
    approach: approach(i),
  };
}

function opportunity(hasSite: boolean, a: SiteAudit | null): string {
  if (!hasSite) return 'Création site';
  if (a?.socialOnly) return 'Création site (juste réseau social)';
  if (a && !a.reachable) return 'Site mort - refonte';
  if (a?.builder) return `Refonte (builder ${a.builder})`;
  if (a && !a.mobile) return 'Refonte (pas responsive)';
  if (a && !a.https) return 'Refonte (pas HTTPS)';
  return 'Site correct';
}

function siteStatus(hasSite: boolean, a: SiteAudit | null): string {
  if (!hasSite) return 'aucun site';
  if (a?.socialOnly) return 'réseau social';
  if (a && !a.reachable) return 'hors ligne';
  return a?.builder ? `en ligne (${a.builder})` : 'en ligne';
}

function approach(i: ScoreInput): string {
  return i.phone ? 'Téléphone' : i.email ? 'Email' : 'Prospection physique';
}
