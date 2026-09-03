import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Persisted configuration. */
export interface Config {
  /** Google Places API key. */
  placesKey?: string;
  /** Default fields to export when `--fields` is not passed. */
  fields?: string[];
  /** Default output format. */
  format?: ExportFormat;
  /** Default country (name or ISO code, e.g. `Canada` / `CA`). */
  country?: string;
  /** Default region / state / province (e.g. `Quebec`, `Île-de-France`). */
  region?: string;
  /** Default city (e.g. `Montreal`, `Paris`). */
  city?: string;
  /** Default source: `places` or `osm`. */
  source?: string;
  /** Default language code (e.g. `fr`, `en`). */
  language?: string;
  /** HTTP(S) proxies to rotate through for requests. */
  proxies?: string[];
  /** Join-Jump login email (for exporting leads as clients). */
  jumpEmail?: string;
  /** Join-Jump password. */
  jumpPassword?: string;
  /** Stable per-install id used by the cvcrush integration. */
  appId?: string;
  /** leadjet-web base URL (Vercel in prod, localhost in dev). */
  webUrl?: string;
  /** Device token linking this CLI to the web account (valid 7 days). */
  linkToken?: string;
  /** ISO expiry of the link token. */
  linkTokenExpires?: string;
}

export type ExportFormat = 'json' | 'csv' | 'ndjson';

const APP = 'leadjet';

/**
 * The per-user config directory. On Windows this is `%APPDATA%` (Roaming);
 * macOS uses Application Support; Linux follows the XDG base dir spec.
 */
export function configDir(): string {
  if (process.platform === 'win32') {
    const roaming = process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming');
    return join(roaming, APP);
  }
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', APP);
  }
  const xdg = process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config');
  return join(xdg, APP);
}

export function configFile(): string {
  return join(configDir(), 'config.json');
}

export function loadConfig(): Config {
  try {
    const file = configFile();
    if (!existsSync(file)) return {};
    return JSON.parse(readFileSync(file, 'utf8')) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  const dir = configDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const file = configFile();
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 });
  renameSync(tmp, file);
}

/** Config keys the user may set via the CLI, mapped to their parsed shape. */
export const CONFIG_KEYS = [
  'places-key',
  'fields',
  'format',
  'country',
  'region',
  'city',
  'source',
  'language',
  'proxies',
  'jump-email',
  'jump-password',
  'web-url',
] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];

export function isConfigKey(value: string): value is ConfigKey {
  return (CONFIG_KEYS as readonly string[]).includes(value);
}

export function setConfigValue(config: Config, key: ConfigKey, value: string): Config {
  const next = { ...config };
  switch (key) {
    case 'places-key':
      next.placesKey = value;
      break;
    case 'fields':
      next.fields = value
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      break;
    case 'format':
      next.format = value as ExportFormat;
      break;
    case 'country':
      next.country = value.trim();
      break;
    case 'region':
      next.region = value.trim();
      break;
    case 'city':
      next.city = value.trim();
      break;
    case 'source':
      next.source = value.trim().toLowerCase();
      break;
    case 'language':
      next.language = value.toLowerCase();
      break;
    case 'proxies':
      next.proxies = value
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      break;
    case 'jump-email':
      next.jumpEmail = value.trim();
      break;
    case 'jump-password':
      next.jumpPassword = value;
      break;
    case 'web-url':
      next.webUrl = value.trim().replace(/\/+$/, '');
      break;
  }
  return next;
}

/** Return the stable per-install id, creating and persisting one if absent. */
export function getAppId(): string {
  const config = loadConfig();
  if (config.appId) return config.appId;
  const appId = randomUUID();
  saveConfig({ ...config, appId });
  return appId;
}

/** A view of the config safe to print (secrets masked). */
export function redactConfig(config: Config): Record<string, unknown> {
  return {
    ...config,
    placesKey: config.placesKey ? maskKey(config.placesKey) : undefined,
    jumpPassword: config.jumpPassword ? '••••••••' : undefined,
    linkToken: config.linkToken ? '••••••••' : undefined,
    proxies: config.proxies?.map(maskProxyCreds),
  };
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

/** Hide any user:pass credentials in a proxy URL. */
function maskProxyCreds(url: string): string {
  try {
    const u = new URL(url);
    if (u.username || u.password) {
      u.username = '***';
      u.password = '';
    }
    return u.toString();
  } catch {
    return url.replace(/\/\/[^@/]+@/, '//***@');
  }
}
