import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { app, safeStorage } from 'electron';
import { EncryptedFileTokenStore, JumpClient } from '@thmxsweb/jj-sdk';
import type { AuthState, MoneySnapshot } from '../shared/ipc.js';

/**
 * Owns the Join-Jump session in the main process. The session is persisted to an
 * encrypted file whose key is protected by the OS keychain (Electron
 * `safeStorage`), so the user stays logged in across restarts without their
 * credentials ever touching disk in plaintext.
 */
export class JumpService {
  private client: JumpClient | null = null;

  private get dir(): string {
    const dir = join(app.getPath('userData'), 'session');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  /** Get or create the key that encrypts the session file. */
  private sessionSecret(): string {
    const keyPath = join(this.dir, 'session.key');
    if (existsSync(keyPath)) {
      const raw = readFileSync(keyPath);
      if (safeStorage.isEncryptionAvailable()) {
        try {
          return safeStorage.decryptString(raw);
        } catch {
          /* fall through and regenerate */
        }
      } else {
        return raw.toString('utf8');
      }
    }
    const secret = randomBytes(32).toString('hex');
    const toStore = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(secret)
      : Buffer.from(secret, 'utf8');
    writeFileSync(keyPath, toStore, { mode: 0o600 });
    return secret;
  }

  private store(): EncryptedFileTokenStore {
    return new EncryptedFileTokenStore({
      path: join(this.dir, 'session.bin'),
      secret: this.sessionSecret(),
    });
  }

  private ensureClient(credentials?: { email: string; password: string }): JumpClient {
    if (credentials) {
      this.client = new JumpClient({
        email: credentials.email,
        password: credentials.password,
        tokenStore: this.store(),
      });
    } else if (!this.client) {
      this.client = new JumpClient({ tokenStore: this.store() });
    }
    return this.client;
  }

  async status(): Promise<AuthState> {
    try {
      const { user } = await this.ensureClient().users.me();
      return {
        authenticated: true,
        user: { first_name: user.first_name, last_name: user.last_name, email: user.email },
      };
    } catch {
      return { authenticated: false, user: null };
    }
  }

  async login(email: string, password: string): Promise<AuthState> {
    const { user } = await this.ensureClient({ email, password }).users.me();
    return {
      authenticated: true,
      user: { first_name: user.first_name, last_name: user.last_name, email: user.email },
    };
  }

  async logout(): Promise<void> {
    await this.ensureClient().logout();
    this.client = null;
  }

  async money(): Promise<MoneySnapshot> {
    const jump = this.ensureClient();
    const [balance, operations, pricing] = await Promise.all([
      jump.banking.balance(),
      jump.banking.operations({ limit: 8 }),
      jump.fees.pricing(),
    ]);
    const [usd, cad] = await Promise.all([
      jump.currency.convert(balance.amount, balance.currency, 'USD'),
      jump.currency.convert(balance.amount, balance.currency, 'CAD'),
    ]);
    return {
      balance: { amount: balance.amount, currency: balance.currency },
      pricing: { amount: pricing.amount },
      converted: { USD: usd, CAD: cad },
      operations: operations.balance_operations.map((op) => ({
        date: op.created_at ?? null,
        amount: op.amount ?? 0,
        type: op.type ?? null,
      })),
    };
  }
}
