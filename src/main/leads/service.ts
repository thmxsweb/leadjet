import { randomUUID } from 'node:crypto';
import type { AuditResult, Lead, LeadSearchInput, LeadStatus } from '../../shared/lead.js';
import { auditSite } from './audit.js';
import { osmSearch, type RawBusiness } from './osm.js';
import { LeadStore } from './store.js';

/** Orchestrates discovery, scoring, and persistence of leads. */
export class LeadService {
  private readonly store = new LeadStore();

  async search(input: LeadSearchInput): Promise<Lead[]> {
    const businesses = await osmSearch(input.city, input.category ?? 'any', input.limit ?? 40);
    return businesses.map((b) => this.toLead(b));
  }

  list(): Lead[] {
    return this.store.list();
  }

  save(lead: Lead): Lead {
    return this.store.upsert(lead);
  }

  updateStatus(id: string, status: LeadStatus): void {
    this.store.update(id, { status });
  }

  update(id: string, patch: Partial<Lead>): Lead {
    return this.store.update(id, patch);
  }

  remove(id: string): void {
    this.store.remove(id);
  }

  audit(url: string): Promise<AuditResult> {
    return auditSite(url);
  }

  private toLead(b: RawBusiness): Lead {
    const hasWebsite = Boolean(b.website);
    const score = hasWebsite ? 45 : Math.min(95, 85 + (b.phone ? 5 : 0));
    const scoreReason = hasWebsite
      ? 'Has a website — audit it to see if it is weak'
      : 'No website found';
    const now = new Date().toISOString();
    return {
      id: randomUUID(),
      name: b.name,
      category: b.category,
      website: b.website,
      phone: b.phone,
      email: b.email,
      address: b.address,
      city: b.city,
      lat: b.lat,
      lon: b.lon,
      source: 'osm',
      score,
      scoreReason,
      status: 'new',
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
  }
}
