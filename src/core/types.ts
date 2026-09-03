/** Minimal shape of a Google Places API v1 place (only fields we may read). */
export interface PlaceV1 {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  regularOpeningHours?: { openNow?: boolean };
  priceLevel?: string;
}

/** A cell value in an exported lead. */
export type Value = string | number | boolean | null;

/**
 * A normalized lead produced by any source (Google Places, OpenStreetMap). The
 * exporter projects this down to the fields the user asked for.
 */
export interface RawLead {
  name: Value;
  address: Value;
  phone: Value;
  email: Value;
  website: Value;
  rating: Value;
  reviews: Value;
  maps: Value;
  type: Value;
  status: Value;
  lat: Value;
  lng: Value;
  place_id: Value;
  /** Which source produced this lead. */
  source: string;
}

/** An exported lead: a flat record keyed by the user-selected field names. */
export type Lead = Record<string, Value>;
