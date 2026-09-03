import { describe, expect, it } from 'vitest';
import { placeToRaw } from '../src/core/places';

describe('placeToRaw', () => {
  it('normalizes a Places result', () => {
    const raw = placeToRaw({
      id: 'PID',
      displayName: { text: 'Biz' },
      formattedAddress: '1 St',
      internationalPhoneNumber: '+1 555',
      nationalPhoneNumber: '555',
      websiteUri: 'https://b.co',
      rating: 4.1,
      userRatingCount: 22,
      googleMapsUri: 'https://maps',
      primaryTypeDisplayName: { text: 'Restaurant' },
      businessStatus: 'OPERATIONAL',
      location: { latitude: 45.5, longitude: -73.5 },
    });
    expect(raw).toMatchObject({
      name: 'Biz',
      phone: '+1 555',
      website: 'https://b.co',
      type: 'Restaurant',
      place_id: 'PID',
      lat: 45.5,
      lng: -73.5,
      email: null,
      source: 'places',
    });
  });
});
