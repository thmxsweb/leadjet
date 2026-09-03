import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';
import type { Lead } from '../../shared/lead.js';

/**
 * Local JSON-file store for saved leads (the pipeline). Behind the same shape a
 * SQLite or cloud-API repository will implement later, so the UI never changes.
 */
export class LeadStore {
  private get file(): string {
    const dir = join(app.getPath('userData'), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return join(dir, 'leads.json');
  }

  private read(): Lead[] {
    try {
      if (!existsSync(this.file)) return [];
      return JSON.parse(readFileSync(this.file, 'utf8')) as Lead[];
    } catch {
      return [];
    }
  }

  private write(leads: Lead[]): void {
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(leads, null, 2));
    renameSync(tmp, this.file);
  }

  list(): Lead[] {
    return this.read().sort((a, b) => b.score - a.score);
  }

  upsert(lead: Lead): Lead {
    const all = this.read();
    const now = new Date().toISOString();
    const next: Lead = { ...lead, updatedAt: now, createdAt: lead.createdAt || now };
    const i = all.findIndex((l) => l.id === lead.id);
    if (i >= 0) all[i] = next;
    else all.push(next);
    this.write(all);
    return next;
  }

  update(id: string, patch: Partial<Lead>): Lead {
    const all = this.read();
    const i = all.findIndex((l) => l.id === id);
    const current = all[i];
    if (i < 0 || !current) throw new Error(`Lead ${id} not found`);
    const next: Lead = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
    all[i] = next;
    this.write(all);
    return next;
  }

  remove(id: string): void {
    this.write(this.read().filter((l) => l.id !== id));
  }
}
