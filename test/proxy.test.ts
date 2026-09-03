import { afterEach, describe, expect, it } from 'vitest';
import { maskProxyUrl, parseProxyList, ProxyRotator } from '../src/core/proxy';

describe('parseProxyList', () => {
  it('splits on commas and newlines, ignoring comments and blanks', () => {
    const list = parseProxyList('http://a:1, http://b:2\n# comment\n\nhttp://c:3');
    expect(list).toEqual(['http://a:1', 'http://b:2', 'http://c:3']);
  });
});

describe('maskProxyUrl', () => {
  it('hides credentials', () => {
    expect(maskProxyUrl('http://user:pass@host:8080')).toBe('http://***@host:8080/');
  });
  it('leaves credential-free URLs intact', () => {
    expect(maskProxyUrl('http://host:8080')).toBe('http://host:8080/');
  });
});

describe('ProxyRotator', () => {
  const rotators: ProxyRotator[] = [];
  afterEach(async () => {
    for (const r of rotators.splice(0)) await r.close();
  });

  it('is empty for an empty pool', () => {
    const r = new ProxyRotator([]);
    rotators.push(r);
    expect(r.size).toBe(0);
    expect(r.next()).toBeUndefined();
  });

  it('round-robins and reuses one agent per URL', () => {
    const r = new ProxyRotator(['http://127.0.0.1:8080', 'http://127.0.0.1:8081']);
    rotators.push(r);
    const a = r.next();
    const b = r.next();
    const c = r.next();
    expect(a).not.toBe(b); // different proxies
    expect(a).toBe(c); // wrapped around to the first, same cached agent
  });
});
