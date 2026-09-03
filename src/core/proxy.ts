import { ProxyAgent, type Dispatcher } from 'undici';

/**
 * Round-robin pool of HTTP(S) proxies. Each `next()` returns the dispatcher for
 * the next proxy in the list, spreading requests across them to dodge rate
 * limits and IP blocks. One agent is created and reused per proxy URL.
 */
export class ProxyRotator {
  private readonly agents = new Map<string, ProxyAgent>();
  private index = 0;

  constructor(private readonly urls: string[]) {}

  get size(): number {
    return this.urls.length;
  }

  /** Dispatcher for the next proxy, or `undefined` if the pool is empty. */
  next(): Dispatcher | undefined {
    if (this.urls.length === 0) return undefined;
    const url = this.urls[this.index % this.urls.length]!;
    this.index += 1;
    let agent = this.agents.get(url);
    if (!agent) {
      agent = new ProxyAgent(url);
      this.agents.set(url, agent);
    }
    return agent;
  }

  async close(): Promise<void> {
    for (const agent of this.agents.values()) await agent.close();
  }
}

/** Parse a proxy list from comma- or newline-separated text (ignores `#` comments). */
export function parseProxyList(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/** Hide credentials in a proxy URL for safe printing. */
export function maskProxyUrl(url: string): string {
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
