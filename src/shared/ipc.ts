/**
 * The typed contract shared between the Electron main process and the renderer.
 * Keep this dependency-free so both sides can import it.
 */

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
  AppVersion: 'app:version',
} as const;
