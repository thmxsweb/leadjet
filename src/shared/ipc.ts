/**
 * The typed contract shared between the Electron main process and the renderer.
 * Keep this dependency-free so both sides can import it.
 */
import type { AuditResult, Lead, LeadSearchInput, LeadStatus } from './lead.js';

export interface AuthUser {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthState {
  authenticated: boolean;
  user: AuthUser | null;
}

export interface MoneyOperation {
  date: string | null;
  amount: number;
  type: string | null;
}

export interface MoneySnapshot {
  balance: { amount: number; currency: string };
  operations: MoneyOperation[];
  pricing: { amount: number };
  /** Balance converted to a few currencies for display. */
  converted: { USD: number; CAD: number };
}

/** The API surface exposed on `window.leadjet`. */
export interface LeadjetApi {
  jump: {
    status: () => Promise<AuthState>;
    login: (email: string, password: string) => Promise<AuthState>;
    logout: () => Promise<void>;
    money: () => Promise<MoneySnapshot>;
  };
  leads: {
    /** Discover leads from a source (not yet saved). */
    search: (input: LeadSearchInput) => Promise<Lead[]>;
    /** All saved leads (the pipeline). */
    list: () => Promise<Lead[]>;
    /** Add/update a lead in the pipeline. */
    save: (lead: Lead) => Promise<Lead>;
    updateStatus: (id: string, status: LeadStatus) => Promise<void>;
    update: (id: string, patch: Partial<Lead>) => Promise<Lead>;
    remove: (id: string) => Promise<void>;
    /** Audit a business website and return quality issues + score. */
    audit: (url: string) => Promise<AuditResult>;
  };
  app: {
    version: () => Promise<string>;
  };
}

/** IPC channel names, kept in one place. */
export const IpcChannel = {
  JumpStatus: 'jump:status',
  JumpLogin: 'jump:login',
  JumpLogout: 'jump:logout',
  JumpMoney: 'jump:money',
  LeadsSearch: 'leads:search',
  LeadsList: 'leads:list',
  LeadsSave: 'leads:save',
  LeadsUpdateStatus: 'leads:update-status',
  LeadsUpdate: 'leads:update',
  LeadsRemove: 'leads:remove',
  LeadsAudit: 'leads:audit',
  AppVersion: 'app:version',
} as const;
