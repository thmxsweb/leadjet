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

/** An exported lead: a flat record keyed by the user-selected field names. */
export type Lead = Record<string, string | number | boolean | null>;
