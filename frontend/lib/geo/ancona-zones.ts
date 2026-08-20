/**
 * Approximate neighbourhood centroids for Ancona (privacy-safe pins).
 * Exact addresses stay off the public map — we only show zone-level points
 * unless the property has explicit lat/lng in the DB.
 */

export const ANCONA_CENTER: [number, number] = [13.5189, 43.6158]; // [lng, lat]

/** Zone label (case-insensitive contains) → [lng, lat] */
const ZONE_CENTROIDS: { match: RegExp; lng: number; lat: number }[] = [
  { match: /torrette/i, lng: 13.5265, lat: 43.6035 },
  { match: /monte\s*dago|tavernelle|posatora/i, lng: 13.5355, lat: 43.586 },
  { match: /villarey|piazza\s*roma|cavour|centro/i, lng: 13.511, lat: 43.6165 },
  { match: /archi|stazione/i, lng: 13.5075, lat: 43.611 },
  { match: /passeretto|pinocchio/i, lng: 13.534, lat: 43.604 },
  { match: /uomini|piano/i, lng: 13.518, lat: 43.622 },
  { match: /varano/i, lng: 13.545, lat: 43.575 },
];

export function coordsForListing(input: {
  latitude?: number | null;
  longitude?: number | null;
  neighbourhood?: string | null;
  cityLabel?: string | null;
}): { lng: number; lat: number; approximate: boolean } | null {
  if (
    typeof input.latitude === "number" &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
  ) {
    return { lng: input.longitude, lat: input.latitude, approximate: false };
  }

  const zone = input.neighbourhood?.trim() ?? "";
  for (const row of ZONE_CENTROIDS) {
    if (zone && row.match.test(zone)) {
      // Slight deterministic jitter so stacked pins in same zone separate
      const hash = [...zone].reduce((a, c) => a + c.charCodeAt(0), 0);
      const jitterLng = ((hash % 17) - 8) * 0.00035;
      const jitterLat = ((hash % 13) - 6) * 0.00035;
      return {
        lng: row.lng + jitterLng,
        lat: row.lat + jitterLat,
        approximate: true,
      };
    }
  }

  // Fallback: city center only if we know it's Ancona
  const city = (input.cityLabel ?? "").toLowerCase();
  if (!city || city.includes("ancona")) {
    return { lng: ANCONA_CENTER[0], lat: ANCONA_CENTER[1], approximate: true };
  }
  return null;
}
