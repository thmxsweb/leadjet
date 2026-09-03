import type { PlaceV1 } from './types.js';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const PAGE_SIZE = 20; // Places API v1 max per page.

export interface SearchOptions {
  key: string;
  query: string;
  fieldMask: string;
  limit: number;
  region?: string;
  language?: string;
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

/**
 * Google Places API v1 text search. Pages through results (20 at a time) up to
 * `limit`, requesting only the fields in `fieldMask`.
 */
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

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': options.key,
        'x-goog-fieldmask': `${options.fieldMask},nextPageToken`,
      },
      body: JSON.stringify(body),
    });

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
