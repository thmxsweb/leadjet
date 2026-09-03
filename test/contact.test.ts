import { describe, expect, it } from 'vitest';
import {
  contactToRow,
  discoverPages,
  extractEmails,
  extractOwner,
  extractPhones,
  extractSocials,
  type Contact,
} from '../src/core/contact';

describe('extractEmails', () => {
  it('collects mailto and plain emails, drops junk, ranks named first', () => {
    const html = `
      <a href="mailto:info@shop.fr">write us</a>
      contact us at Jean.Dupont@Shop.FR or noreply@shop.fr
      <img src="logo@2x.png"> sentry-abc@sentry.wixpress.com
    `;
    const emails = extractEmails(html);
    expect(emails).toContain('jean.dupont@shop.fr');
    expect(emails).toContain('info@shop.fr');
    expect(emails).toContain('noreply@shop.fr');
    expect(emails).not.toContain('sentry-abc@sentry.wixpress.com');
    expect(emails.every((e) => !e.includes('logo@2x'))).toBe(true);
    // named address ranks before info@ before noreply@
    expect(emails.indexOf('jean.dupont@shop.fr')).toBeLessThan(emails.indexOf('info@shop.fr'));
    expect(emails.indexOf('info@shop.fr')).toBeLessThan(emails.indexOf('noreply@shop.fr'));
  });

  it('cleans HTML fragments dragged in by unquoted mailto links', () => {
    const html = `
      <a href=mailto:info@resto.com</p>x</a>
      <a href=mailto:hello@resto.com<br>y</a>
      contact\\ owner@resto.com\\ end
    `;
    const emails = extractEmails(html);
    expect(emails).toContain('info@resto.com');
    expect(emails).toContain('hello@resto.com');
    expect(emails).toContain('owner@resto.com');
    expect(emails.every((e) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(e))).toBe(true);
  });

  it('drops booking/hosting platform noise', () => {
    const emails = extractEmails('a@zenchef.com support@ovh.com real@bistro.fr');
    expect(emails).toEqual(['real@bistro.fr']);
  });
});

describe('extractPhones', () => {
  it('reads tel: links', () => {
    const html = `<a href="tel:+1 450 349 2055">call</a><a href="tel:0123456789">fr</a>`;
    expect(extractPhones(html)).toEqual(['+1 450 349 2055', '0123456789']);
  });
});

describe('extractSocials', () => {
  it('finds one profile per network and skips share links', () => {
    const html = `
      <a href="https://www.facebook.com/myshop">fb</a>
      <a href="https://facebook.com/sharer/sharer.php?u=x">share</a>
      <a href="//instagram.com/myshop">ig</a>
      <a href="https://x.com/myshop">x</a>
    `;
    const s = extractSocials(html);
    expect(s.facebook).toBe('https://www.facebook.com/myshop');
    expect(s.instagram).toBe('https://instagram.com/myshop');
    expect(s.twitter).toBe('https://x.com/myshop');
  });
});

describe('extractOwner', () => {
  it('reads founder from JSON-LD', () => {
    const html = `<script type="application/ld+json">
      {"@type":"Organization","name":"Shop","founder":{"@type":"Person","name":"Marie Curie"}}
    </script>`;
    expect(extractOwner(html)).toBe('Marie Curie');
  });

  it('walks @graph and falls back to meta author', () => {
    const graph = `<script type="application/ld+json">
      {"@graph":[{"@type":"WebSite"},{"@type":"Person","name":"Paul Martin"}]}
    </script>`;
    expect(extractOwner(graph)).toBe('Paul Martin');
    const meta = `<meta name="author" content="Sophie Bernard">`;
    expect(extractOwner(meta)).toBe('Sophie Bernard');
    expect(extractOwner(`<meta name="author" content="WordPress">`)).toBeNull();
  });
});

describe('discoverPages', () => {
  it('returns internal contact/about pages only, capped', () => {
    const html = `
      <a href="/contact">Contact</a>
      <a href="/a-propos">À propos</a>
      <a href="https://facebook.com/x">Social</a>
      <a href="/blog">Blog</a>
      <a href="https://other.com/team">Team elsewhere</a>
    `;
    const pages = discoverPages(html, 'https://shop.fr/', 5);
    expect(pages).toContain('https://shop.fr/contact');
    expect(pages).toContain('https://shop.fr/a-propos');
    expect(pages.some((p) => p.includes('other.com'))).toBe(false);
    expect(pages.some((p) => p.includes('/blog'))).toBe(false);
  });
});

describe('contactToRow', () => {
  it('flattens a contact, first email/phone promoted', () => {
    const c: Contact = {
      name: 'Shop',
      website: 'https://shop.fr',
      owner: 'Marie Curie',
      emails: ['marie@shop.fr', 'info@shop.fr'],
      phones: ['+33 1 23 45 67 89'],
      facebook: 'https://facebook.com/shop',
      instagram: null,
      linkedin: null,
      twitter: null,
      youtube: null,
    };
    const row = contactToRow(c);
    expect(row.owner).toBe('Marie Curie');
    expect(row.email).toBe('marie@shop.fr');
    expect(row.emails).toBe('marie@shop.fr | info@shop.fr');
    expect(row.phone).toBe('+33 1 23 45 67 89');
    expect(row.facebook).toBe('https://facebook.com/shop');
    expect(row.linkedin).toBeNull();
  });
});
