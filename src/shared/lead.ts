/** A discovered or saved business lead. Shared between main and renderer. */
export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'won' | 'lost';

export type LeadSourceKind = 'osm' | 'places' | 'manual';

export const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'proposal', 'won', 'lost'];

export interface Lead {
  id: string;
  name: string;
  category: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  source: LeadSourceKind;
  /** Opportunity score 0-100 (higher = more likely to need a website). */
  score: number;
  scoreReason: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Search request for the Radar. */
export interface LeadSearchInput {
  source: 'osm';
  city: string;
  /** A category key from the Radar's category list, or `any`. */
  category?: string;
  limit?: number;
}

/** Result of auditing a business website. */
export interface AuditResult {
  url: string;
  status: number | null;
  reachable: boolean;
  https: boolean;
  mobileFriendly: boolean;
  title: string | null;
  issues: string[];
  /** Opportunity score derived from the audit (higher = weaker site). */
  score: number;
}

/** Category options offered in the Radar UI. */
export const LEAD_CATEGORIES: { key: string; label: string }[] = [
  { key: 'any', label: 'Any business' },
  { key: 'shops', label: 'Shops & retail' },
  { key: 'food', label: 'Food & drink' },
  { key: 'craft', label: 'Craftspeople & trades' },
  { key: 'services', label: 'Services & offices' },
  { key: 'beauty', label: 'Beauty & wellness' },
];
