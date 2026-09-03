import { describe, expect, it } from 'vitest';
import { countryCode, locationText, placesQuery } from '../src/core/location';

describe('countryCode', () => {
  it('maps common names to ISO codes', () => {
    expect(countryCode('Canada')).toBe('CA');
    expect(countryCode('france')).toBe('FR');
    expect(countryCode('Belgique')).toBe('BE');
  });
  it('accepts a 2-letter code directly', () => {
    expect(countryCode('ca')).toBe('CA');
  });
  it('returns undefined for unknown / empty', () => {
    expect(countryCode('Atlantis')).toBeUndefined();
    expect(countryCode(undefined)).toBeUndefined();
  });
});

describe('locationText / placesQuery', () => {
  it('joins city, region, country', () => {
    expect(locationText({ city: 'Montreal', region: 'QC', country: 'CA' })).toBe(
      'Montreal, QC, CA',
    );
  });
  it('builds a places query with location', () => {
    expect(placesQuery('restaurants', { city: 'Paris', country: 'France' })).toBe(
      'restaurants in Paris, France',
    );
  });
  it('returns the bare term with no location', () => {
    expect(placesQuery('restaurants', {})).toBe('restaurants');
  });
});
