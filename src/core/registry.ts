import { request } from './http.js';
import type { ProxyRotator } from './proxy.js';

/** Owner / company details resolved from the French business registry. */
export interface OwnerInfo {
  owner: string;
  role: string;
  owner2: string;
  role2: string;
  legal: string;
  naf: string;
  activity: string;
  legalForm: string;
  created: string;
  size: string;
  regCity: string;
  regCp: string;
  regAddress: string;
  siren: string;
  siret: string;
  vat: string;
  confidence: 'high' | 'medium';
}

/** French intra-community VAT number, computed from the SIREN. */
function frVat(siren: string): string {
  if (!/^\d{9}$/.test(siren)) return '';
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(key).padStart(2, '0')}${siren}`;
}

const API = 'https://recherche-entreprises.api.gouv.fr/search';

const LEGAL: Record<string, string> = {
  '1000': 'Entrepreneur individuel',
  '5202': 'SNC',
  '5410': 'SARL',
  '5498': 'EURL',
  '5499': 'SARL',
  '5505': 'SA',
  '5710': 'SAS',
  '5720': 'SASU',
  '6540': 'SCI',
  '9220': 'Association',
};
const EFFECTIF: Record<string, string> = {
  '00': '0 salarié',
  '01': '1-2',
  '02': '3-5',
  '03': '6-9',
  '11': '10-19',
  '12': '20-49',
  '21': '50-99',
  '22': '100-199',
  '31': '200-249',
  '32': '250-499',
  '41': '500-999',
};
const NAF: Record<string, string> = {
  '56.10A': 'Restauration traditionnelle',
  '56.10B': 'Cafétéria / libre-service',
  '56.10C': 'Restauration rapide',
  '56.30Z': 'Débit de boissons (bar)',
  '10.71C': 'Boulangerie-pâtisserie',
  '10.71D': 'Pâtisserie',
  '47.24Z': 'Commerce pain/pâtisserie',
  '47.22Z': 'Boucherie-charcuterie',
  '47.23Z': 'Poissonnerie',
  '47.29Z': 'Alimentation spécialisée',
  '47.11B': 'Supérette',
  '47.11F': 'Épicerie',
  '47.73Z': 'Pharmacie',
  '47.76Z': 'Fleuriste',
  '47.75Z': 'Parfumerie / beauté',
  '47.71Z': 'Habillement',
  '47.72A': 'Chaussures',
  '96.02A': 'Coiffure',
  '96.02B': 'Soins de beauté',
  '96.09Z': 'Services divers',
  '45.20A': 'Garage - entretien auto',
  '45.20B': 'Garage - carrosserie',
  '43.22A': 'Plomberie / chauffage',
  '43.21A': 'Électricité',
  '43.34Z': 'Peinture / vitrerie',
  '43.32A': 'Menuiserie',
  '80.20Z': 'Serrurerie / sécurité',
  '55.10Z': 'Hôtel',
};

interface Dirigeant {
  nom?: string;
  prenoms?: string;
  qualite?: string;
}
interface Etablissement {
  siren?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  activite_principale?: string;
  nature_juridique?: string;
  date_creation?: string;
  tranche_effectif_salarie?: string;
  etat_administratif?: string;
  dirigeants?: Dirigeant[];
  siege?: { code_postal?: string; libelle_commune?: string; adresse?: string; siret?: string };
}

const titleCase = (s: string): string =>
  s.toLowerCase().replace(/\b([a-zà-ÿ])/g, (m) => m.toUpperCase());
const cpOf = (addr: string): string | null => addr.match(/\b(\d{5})\b/)?.[1] ?? null;

function roleScore(q: string): number {
  const s = q.toLowerCase();
  if (
    /g[eé]rant|président|presidente|directeur général|propriétaire|exploitant|entrepreneur individuel/.test(
      s,
    )
  )
    return 0;
  if (/associé|directeur|administrateur/.test(s)) return 1;
  if (/commissaire|suppléant|conseil|membre/.test(s)) return 3;
  return 2;
}

function people(e: Etablissement): { name: string; role: string }[] {
  return (e.dirigeants ?? [])
    .filter((d) => d.nom ?? d.prenoms)
    .sort((a, b) => roleScore(a.qualite ?? '') - roleScore(b.qualite ?? ''))
    .map((d) => ({
      name: titleCase(`${d.prenoms ?? ''} ${d.nom ?? ''}`.trim()),
      role: d.qualite ?? '',
    }));
}

// Self-throttle to stay comfortably under the API's rate limit (~7 req/s).
let nextSlot = 0;
async function gate(): Promise<void> {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + 180;
  if (wait) await new Promise((r) => setTimeout(r, wait));
}

/** Look up the owner and company details for a business by name (+ address). */
export async function lookupOwner(
  name: string,
  address: string,
  proxies?: ProxyRotator,
): Promise<OwnerInfo | null> {
  const cp = cpOf(address);
  const params = new URLSearchParams({ q: name, per_page: '5' });
  if (cp) params.set('code_postal', cp);
  await gate();
  let data: { results?: Etablissement[] };
  try {
    const res = await request(
      `${API}?${params.toString()}`,
      { headers: { accept: 'application/json' } },
      proxies,
    );
    if (!res.ok) return null;
    data = (await res.json()) as { results?: Etablissement[] };
  } catch {
    return null;
  }
  const results = data.results ?? [];
  const m = results.find((e) => e.etat_administratif === 'A') ?? results[0];
  if (!m) return null;
  const ppl = people(m);
  const naf = m.activite_principale ?? '';
  return {
    owner: ppl[0]?.name ?? '',
    role: ppl[0]?.role ?? '',
    owner2: ppl[1]?.name ?? '',
    role2: ppl[1]?.role ?? '',
    legal: m.nom_complet ?? m.nom_raison_sociale ?? '',
    naf,
    activity: NAF[naf] ?? '',
    legalForm: LEGAL[m.nature_juridique ?? ''] ?? '',
    created: (m.date_creation ?? '').slice(0, 4),
    size: EFFECTIF[m.tranche_effectif_salarie ?? ''] ?? '',
    regCity: titleCase(m.siege?.libelle_commune ?? ''),
    regCp: m.siege?.code_postal ?? cp ?? '',
    regAddress: m.siege?.adresse ?? '',
    siren: m.siren ?? '',
    siret: m.siege?.siret ?? '',
    vat: frVat(m.siren ?? ''),
    confidence: cp ? 'high' : 'medium',
  };
}
