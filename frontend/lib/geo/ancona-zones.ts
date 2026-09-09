/**
 * Approximate map pins: exact lat/lng when present, else zone/city centroids.
 * Public student map stays privacy-safe (zone-level) unless coords exist in DB.
 */

export const ANCONA_CENTER: [number, number] = [13.5189, 43.6158]; // [lng, lat]
export const ITALY_CENTER: [number, number] = [12.5, 42.5];

/** Zone label (case-insensitive contains) → [lng, lat] — Ancona neighbourhoods */
const ZONE_CENTROIDS: { match: RegExp; lng: number; lat: number }[] = [
  { match: /torrette/i, lng: 13.5265, lat: 43.6035 },
  { match: /monte\s*dago|tavernelle|posatora/i, lng: 13.5355, lat: 43.586 },
  { match: /villarey|piazza\s*roma|cavour|centro/i, lng: 13.511, lat: 43.6165 },
  { match: /archi|stazione/i, lng: 13.5075, lat: 43.611 },
  { match: /passeretto|pinocchio/i, lng: 13.534, lat: 43.604 },
  { match: /uomini|piano/i, lng: 13.518, lat: 43.622 },
  { match: /varano/i, lng: 13.545, lat: 43.575 },
  { match: /palombina/i, lng: 13.49, lat: 43.625 },
];

/** City name/slug → approximate centre for multi-city admin/owner overview */
const CITY_CENTROIDS: { match: RegExp; lng: number; lat: number }[] = [
  { match: /^ancona$/i, lng: 13.5189, lat: 43.6158 },
  { match: /^pesaro$/i, lng: 12.9133, lat: 43.9098 },
  { match: /^urbino$/i, lng: 12.6366, lat: 43.7262 },
  { match: /^macerata$/i, lng: 13.4535, lat: 43.2981 },
  { match: /^camerino$/i, lng: 13.0686, lat: 43.1358 },
  { match: /^ascoli/i, lng: 13.5761, lat: 42.8535 },
  { match: /^bologna$/i, lng: 11.3426, lat: 44.4949 },
  { match: /^milano|milan$/i, lng: 9.19, lat: 45.4642 },
  { match: /^roma|rome$/i, lng: 12.4964, lat: 41.9028 },
  { match: /^firenze|florence$/i, lng: 11.2558, lat: 43.7696 },
  { match: /^torino|turin$/i, lng: 7.6869, lat: 45.0703 },
  { match: /^napoli|naples$/i, lng: 14.2681, lat: 40.8518 },
  { match: /^padova|padua$/i, lng: 11.8768, lat: 45.4064 },
  { match: /^pisa$/i, lng: 10.4017, lat: 43.7228 },
  { match: /^perugia$/i, lng: 12.3888, lat: 43.1107 },
  { match: /^genova|genoa$/i, lng: 8.9463, lat: 44.4056 },
  { match: /^trieste$/i, lng: 13.7768, lat: 45.6495 },
  { match: /^venezia|venice$/i, lng: 12.3155, lat: 45.4408 },
  { match: /^bari$/i, lng: 16.8719, lat: 41.1171 },
  { match: /^catania$/i, lng: 15.0873, lat: 37.5079 },
  { match: /^palermo$/i, lng: 13.3613, lat: 38.1157 },
  { match: /^cagliari$/i, lng: 9.1217, lat: 39.2238 },
];

function jitterFromKey(key: string): { lng: number; lat: number } {
  const hash = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    lng: ((hash % 17) - 8) * 0.00035,
    lat: ((hash % 13) - 6) * 0.00035,
  };
}

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
      const j = jitterFromKey(zone);
      return {
        lng: row.lng + j.lng,
        lat: row.lat + j.lat,
        approximate: true,
      };
    }
  }

  const city = (input.cityLabel ?? "").trim();
  if (city) {
    for (const row of CITY_CENTROIDS) {
      if (row.match.test(city)) {
        const j = jitterFromKey(`${city}|${zone}`);
        return {
          lng: row.lng + j.lng * 8,
          lat: row.lat + j.lat * 8,
          approximate: true,
        };
      }
    }
  }

  if (!city || /ancona/i.test(city)) {
    return { lng: ANCONA_CENTER[0], lat: ANCONA_CENTER[1], approximate: true };
  }

  return null;
}

export function fitCenterForPoints(
  points: { lng: number; lat: number }[],
): { center: [number, number]; zoom: number } {
  if (points.length === 0) {
    return { center: ANCONA_CENTER, zoom: 11 };
  }
  if (points.length === 1) {
    return { center: [points[0].lng, points[0].lat], zoom: 13 };
  }
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const span = Math.max(maxLng - minLng, maxLat - minLat);
  let zoom = 11;
  if (span > 4) zoom = 5;
  else if (span > 1.5) zoom = 6;
  else if (span > 0.4) zoom = 8;
  else if (span > 0.1) zoom = 10;
  else zoom = 12;
  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
    zoom,
  };
}
