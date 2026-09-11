/**
 * Mapbox Geocoding helpers for the owner publish wizard.
 * Uses NEXT_PUBLIC_MAPBOX_TOKEN (same token as MarketplaceMap).
 * No hardcoded Ancona campus lists — POIs are queried near the listing pin.
 */

export type GeocodedAddress = {
  id: string;
  label: string;
  address: string;
  city: string;
  zone: string;
  latitude: number;
  longitude: number;
};

export type NearbyPoi = {
  id: string;
  name: string;
  category: "universita" | "trasporti" | "lavoro";
  distanceM: number | null;
  latitude: number;
  longitude: number;
};

export type PoiAudience = "studenti" | "lavoratori" | "entrambi";

function mapboxToken(): string {
  return (process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "").trim();
}

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

type MapboxFeature = {
  id: string;
  place_name: string;
  text?: string;
  center: [number, number];
  context?: { id: string; text: string }[];
  place_type?: string[];
  properties?: { category?: string; address?: string };
};

function cityFromContext(feature: MapboxFeature): string {
  const ctx = feature.context ?? [];
  const place = ctx.find((c) => c.id.startsWith("place."));
  const locality = ctx.find((c) => c.id.startsWith("locality."));
  return (place?.text || locality?.text || "").trim();
}

function zoneFromContext(feature: MapboxFeature): string {
  const ctx = feature.context ?? [];
  const neighborhood = ctx.find((c) => c.id.startsWith("neighborhood."));
  const locality = ctx.find((c) => c.id.startsWith("locality."));
  return (neighborhood?.text || locality?.text || "").trim();
}

function featureToAddress(feature: MapboxFeature): GeocodedAddress {
  const [longitude, latitude] = feature.center;
  const city = cityFromContext(feature);
  const zone = zoneFromContext(feature) || city;
  return {
    id: feature.id,
    label: feature.place_name,
    address: feature.place_name.split(",")[0]?.trim() || feature.place_name,
    city: city || "Italia",
    zone: zone || city || "Centro",
    latitude,
    longitude,
  };
}

/** Address / place autocomplete restricted to Italy. */
export async function suggestAddresses(
  query: string,
  opts?: { proximity?: { lng: number; lat: number }; limit?: number },
): Promise<GeocodedAddress[]> {
  const token = mapboxToken();
  if (!token || query.trim().length < 3) return [];

  const params = new URLSearchParams({
    access_token: token,
    autocomplete: "true",
    country: "it",
    language: "it",
    types: "address,place,locality,neighborhood",
    limit: String(opts?.limit ?? 6),
  });
  if (opts?.proximity) {
    params.set("proximity", `${opts.proximity.lng},${opts.proximity.lat}`);
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim(),
  )}.json?${params}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: MapboxFeature[] };
  return (data.features ?? []).map(featureToAddress);
}

/** Forward-geocode a free-text address (CSV import). */
export async function geocodeAddress(
  query: string,
): Promise<GeocodedAddress | null> {
  const results = await suggestAddresses(query, { limit: 1 });
  return results[0] ?? null;
}

type PoiQuery = {
  q: string;
  category: NearbyPoi["category"];
};

/**
 * Dynamic POIs near a pin, by seeker audience.
 * Students → universities; workers → stations/coworking; both → union.
 */
export async function fetchNearbyPois(input: {
  latitude: number;
  longitude: number;
  city: string;
  audience: PoiAudience;
}): Promise<NearbyPoi[]> {
  const token = mapboxToken();
  if (!token) return [];

  const queries: PoiQuery[] = [];
  if (input.audience === "studenti" || input.audience === "entrambi") {
    queries.push({
      q: `università ${input.city}`,
      category: "universita",
    });
  }
  if (input.audience === "lavoratori" || input.audience === "entrambi") {
    queries.push({
      q: `stazione ${input.city}`,
      category: "trasporti",
    });
    queries.push({
      q: `coworking ${input.city}`,
      category: "lavoro",
    });
  }

  const results: NearbyPoi[] = [];
  for (const query of queries) {
    const params = new URLSearchParams({
      access_token: token,
      country: "it",
      language: "it",
      types: "poi",
      limit: "4",
      proximity: `${input.longitude},${input.latitude}`,
    });
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query.q,
    )}.json?${params}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as { features?: MapboxFeature[] };
      for (const f of data.features ?? []) {
        const [lng, lat] = f.center;
        const distanceM = Math.round(
          haversineM(input.latitude, input.longitude, lat, lng),
        );
        if (distanceM > 12000) continue;
        results.push({
          id: f.id,
          name: f.text || f.place_name,
          category: query.category,
          distanceM,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch {
      /* ignore single query failure */
    }
  }

  const byName = new Map<string, NearbyPoi>();
  for (const poi of results) {
    const key = poi.name.toLowerCase();
    const prev = byName.get(key);
    if (!prev || (poi.distanceM ?? Infinity) < (prev.distanceM ?? Infinity)) {
      byName.set(key, poi);
    }
  }

  return Array.from(byName.values())
    .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
    .slice(0, 8);
}

export function formatPoiDistance(meters: number | null): string {
  if (meters == null) return "";
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
