import { fetch, type RequestInit, type Response } from 'undici';
import type { ProxyRotator } from './proxy.js';

export const USER_AGENT = 'leadjet/0.1.0 (+https://github.com/thmxsweb/leadjet)';

/** A fetch that routes through the next proxy in the pool, if any. */
export function request(url: string, init: RequestInit, proxies?: ProxyRotator): Promise<Response> {
  const dispatcher = proxies?.next();
  if (dispatcher) init.dispatcher = dispatcher;
  return fetch(url, init);
}
