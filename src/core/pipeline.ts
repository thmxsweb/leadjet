import { auditSite, type SiteAudit } from './audit.js';
import { type Location } from './location.js';
import { osmSearch } from './osm.js';
import { placeToRaw, searchText } from './places.js';
import type { ProxyRotator } from './proxy.js';
import { lookupOwner } from './registry.js';
import { scoreLead } from './scoring.js';
import type { RawLead, Value } from './types.js';

/** A fully enriched, scored lead ready for display or export. */
export interface EnrichedLead {
  [key: string]: Value;
  name: string;
  legal: string;
  activity: string;
  owner: string;
  role: string;
  owner2: string;
  role2: string;
  phone: string;
  email: string;
  website: string;
  score: number;
  priority: string;
  opportunity: string;
  approach: string;
  location: string;
  regCity: string;
  regCp: string;
  siteStatus: string;
  naf: string;
  legalForm: string;
  created: string;
  size: string;
  siren: string;
  siret: string;
  vat: string;
  confidence: string;
  source: string;
  maps: string;
  place_id: string;
  /** Existing site domain (to remake) or a proposed domain if none. */
  domain: string;
  /** 'existing' when the business already has a site, else 'proposal'. */
  domainType: string;
}

export interface PipelineOptions {
  source: 'osm' | 'places';
  term: string;
  location: Location;
  limit: number;
  category?: string;
  distanceKm?: number;
  key?: string;
  language?: string;
  enrichOwner: boolean;
  auditSites: boolean;
  proxies?: ProxyRotator;
  concurrency?: number;
  onLead?: (lead: EnrichedLead) => void;
  onProgress?: (done: number, total: number) => void;
}

const PLACES_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.primaryTypeDisplayName',
  'places.primaryType',
  'places.location',
].join(',');

const str = (v: Value): string => (v == null ? '' : String(v));

function hostOf(url: string): string {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
      /^www\./,
      '',
    );
  } catch {
    return '';
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Propose a domain from the business name (.fr for French postal codes). */
function proposeDomain(name: string, cp: string): string {
  const s = slugify(name);
  if (!s) return '';
  return `${s}${/^\d{5}$/.test(cp) ? '.fr' : '.com'}`;
}

async function search(opts: PipelineOptions): Promise<RawLead[]> {
  if (opts.source === 'places') {
    if (!opts.key) throw new Error('Google Places needs an API key.');
    const places = await searchText({
      key: opts.key,
      query: opts.term,
      fieldMask: PLACES_MASK,
      limit: opts.limit,
      ...(opts.language ? { language: opts.language } : {}),
      ...(opts.proxies ? { proxies: opts.proxies } : {}),
    });
    return places.map(placeToRaw);
  }
  return osmSearch({
    term: opts.term,
    location: opts.location,
    limit: opts.limit,
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.distanceKm ? { distanceKm: opts.distanceKm } : {}),
    ...(opts.proxies ? { proxies: opts.proxies } : {}),
  });
}

/** Run search + optional owner/site enrichment + scoring. Streams via onLead. */
export async function runPipeline(opts: PipelineOptions): Promise<EnrichedLead[]> {
  const raws = await search(opts);
  const total = raws.length;
  const out: EnrichedLead[] = new Array<EnrichedLead>(total);
  let done = 0;

  const worker = async (start: number): Promise<void> => {
    for (let i = start; i < total; i += concurrency) {
      const raw = raws[i];
      if (!raw) continue;
      out[i] = await enrichOne(raw, opts);
      done += 1;
      opts.onProgress?.(done, total);
      opts.onLead?.(out[i]!);
    }
  };
  const concurrency = Math.max(1, Math.min(opts.concurrency ?? 6, 16));
  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, (_, k) => worker(k)));
  return out.filter(Boolean);
}

async function enrichOne(raw: RawLead, opts: PipelineOptions): Promise<EnrichedLead> {
  const website = str(raw.website);
  let audit: SiteAudit | null = null;
  if (opts.auditSites && website) audit = await auditSite(website, opts.proxies, 7000);

  let owner = {
    owner: '',
    role: '',
    owner2: '',
    role2: '',
    legal: '',
    naf: '',
    activity: '',
    legalForm: '',
    created: '',
    size: '',
    regCity: '',
    regCp: '',
    regAddress: '',
    siren: '',
    siret: '',
    vat: '',
    confidence: '' as string,
  };
  if (opts.enrichOwner && str(raw.name)) {
    const info = await lookupOwner(str(raw.name), str(raw.address), opts.proxies);
    if (info) owner = info;
  }

  const email = str(raw.email) || audit?.email || '';
  const phone = str(raw.phone);
  const sc = scoreLead({
    website,
    phone,
    email,
    owner: owner.owner,
    created: owner.created,
    size: owner.size,
    audit,
  });
  const location = [owner.regAddress || str(raw.address), owner.regCity, owner.regCp]
    .filter(Boolean)
    .join(', ');

  return {
    name: str(raw.name),
    legal: owner.legal,
    activity: owner.activity || str(raw.type),
    owner: owner.owner,
    role: owner.role,
    owner2: owner.owner2,
    role2: owner.role2,
    phone,
    email,
    website,
    score: sc.score,
    priority: sc.priority,
    opportunity: sc.opportunity,
    approach: sc.approach,
    location,
    regCity: owner.regCity,
    regCp: owner.regCp,
    siteStatus: sc.siteStatus,
    naf: owner.naf,
    legalForm: owner.legalForm,
    created: owner.created,
    size: owner.size,
    siren: owner.siren,
    siret: owner.siret,
    vat: owner.vat,
    confidence: owner.confidence,
    source: raw.source,
    maps: str(raw.maps),
    place_id: str(raw.place_id),
    domain: website ? hostOf(website) : proposeDomain(str(raw.name), owner.regCp),
    domainType: website ? 'existing' : 'proposal',
  };
}
