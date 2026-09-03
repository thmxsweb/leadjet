import { describe, expect, it } from 'vitest';
import { redactConfig, setConfigValue, type Config } from '../src/core/config';

describe('setConfigValue', () => {
  it('sets the places key', () => {
    const c = setConfigValue({}, 'places-key', 'AIza-secret');
    expect(c.placesKey).toBe('AIza-secret');
  });

  it('parses fields into a trimmed array', () => {
    const c = setConfigValue({}, 'fields', ' name, phone , website ');
    expect(c.fields).toEqual(['name', 'phone', 'website']);
  });

  it('stores country/region/city as-is and lowercases language', () => {
    expect(setConfigValue({}, 'country', 'Canada').country).toBe('Canada');
    expect(setConfigValue({}, 'region', ' Quebec ').region).toBe('Quebec');
    expect(setConfigValue({}, 'city', ' Montreal ').city).toBe('Montreal');
    expect(setConfigValue({}, 'language', 'EN').language).toBe('en');
  });
});

describe('redactConfig', () => {
  it('masks the API key', () => {
    const config: Config = { placesKey: 'AIzaSyABCDEFGH1234' };
    const redacted = redactConfig(config);
    expect(redacted.placesKey).not.toBe('AIzaSyABCDEFGH1234');
    expect(String(redacted.placesKey)).toMatch(/…/);
  });
});
