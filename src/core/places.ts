import { type RequestInit } from 'undici';
import { request, USER_AGENT } from './http.js';
import type { ProxyRotator } from './proxy.js';
import type { PlaceV1, RawLead } from './types.js';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const PAGE_SIZE = 20; // Places API v1 max per page.

export interface SearchOptions {
  key: string;
  query: string;
  fieldMask: string;
  limit: number;
  region?: string;
  language?: string;
  proxies?: ProxyRotator;
}

export class PlacesError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'PlacesError';
  }
}

/** Google Places API v1 text search, paginated up to `limit`. */
export async function searchText(options: SearchOptions): Promise<PlaceV1[]> {
  const results: PlaceV1[] = [];
  let pageToken: string | undefined;

  while (results.length < options.limit) {
    const body: Record<string, unknown> = {
      textQuery: options.query,
      maxResultCount: Math.min(PAGE_SIZE, options.limit - results.length),
    };
    if (options.region) body.regionCode = options.region;
    if (options.language) body.languageCode = options.language;
    if (pageToken) body.pageToken = pageToken;

    const init: RequestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': USER_AGENT,
        'x-goog-api-key': options.key,
        'x-goog-fieldmask': `${options.fieldMask},nextPageToken`,
      },
      body: JSON.stringify(body),
    };

    const res = await request(ENDPOINT, init, options.proxies);
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as {
        error?: { message?: string; status?: string };
      } | null;
      throw new PlacesError(
        detail?.error?.message ?? `Places API request failed (HTTP ${res.status})`,
        res.status,
        detail?.error?.status,
      );
    }

    const data = (await res.json()) as { places?: PlaceV1[]; nextPageToken?: string };
    for (const place of data.places ?? []) {
      results.push(place);
      if (results.length >= options.limit) break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken || !(data.places ?? []).length) break;
  }

  return results;
}

/** Normalize a Places result into a source-agnostic lead. */
export function placeToRaw(place: PlaceV1): RawLead {
  return {
    name: place.displayName?.text ?? null,
    address: place.formattedAddress ?? null,
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    email: null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? null,
    reviews: place.userRatingCount ?? null,
    maps: place.googleMapsUri ?? null,
    type: place.primaryTypeDisplayName?.text ?? place.primaryType ?? null,
    status: place.businessStatus ?? null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    place_id: place.id ?? null,
    source: 'places',
  };
}
