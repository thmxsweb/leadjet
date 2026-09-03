import { describe, expect, it } from 'vitest';
import type { SiteAudit } from '../src/core/audit';
import { scoreLead } from '../src/core/scoring';

const base = { website: '', phone: '', email: '', owner: '', created: '', size: '' };
const audit = (o: Partial<SiteAudit>): SiteAudit => ({
  reachable: false,
  https: false,
  mobile: false,
  builder: '',
  socialOnly: false,
  email: '',
  ...o,
});

describe('scoreLead', () => {
  it('scores a no-website business with phone + owner as Chaud', () => {
    const r = scoreLead({
      ...base,
      phone: '+33 1 23 45 67 89',
      owner: 'Jean Dupont',
      created: '2010',
      size: '3-5',
    });
    // need 60 + phone 12 + owner 8 + age 6 + size 6, capped at 100
    expect(r.score).toBe(92);
    expect(r.priority).toBe('Chaud');
    expect(r.opportunity).toBe('Création site');
    expect(r.approach).toBe('Téléphone');
    expect(r.siteStatus).toBe('aucun site');
  });

  it('flags a dead site as a refonte opportunity', () => {
    const r = scoreLead({
      ...base,
      website: 'http://x.fr',
      phone: '+33 1 00',
      audit: audit({ reachable: false }),
    });
    expect(r.score).toBe(67); // 55 + 12
    expect(r.opportunity).toBe('Site mort - refonte');
    expect(r.siteStatus).toBe('hors ligne');
  });

  it('scores a modern, reachable site low (Froid) with no contact', () => {
    const r = scoreLead({
      ...base,
      website: 'https://x.fr',
      audit: audit({ reachable: true, https: true, mobile: true }),
    });
    expect(r.score).toBe(10);
    expect(r.priority).toBe('Froid');
    expect(r.opportunity).toBe('Site correct');
    expect(r.approach).toBe('Prospection physique');
  });

  it('treats a DIY builder site as needing a refonte', () => {
    const r = scoreLead({
      ...base,
      website: 'https://x.wixsite.com',
      audit: audit({ reachable: true, https: true, mobile: true, builder: 'wix.com' }),
    });
    expect(r.opportunity).toBe('Refonte (builder wix.com)');
    expect(r.score).toBe(35); // need 35, no contact/value
  });

  it('caps the score at 100', () => {
    const r = scoreLead({
      ...base,
      phone: '1',
      email: 'a@b.fr',
      owner: 'X',
      created: '2000',
      size: '10-19',
    });
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
