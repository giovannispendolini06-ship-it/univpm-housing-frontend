import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { HeatingType, Listing, RoomType } from "@/lib/domain/types";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop";

export type ListingFilters = {
  maxPrice?: number;
  minPrice?: number;
  zone?: string;
  verifiedOnly?: boolean;
  guaranteedRentOnly?: boolean;
  privateBathroom?: boolean;
  availableFromBefore?: string; // ISO date — room available_from <= date or null
  sort?: "price_asc" | "price_desc" | "newest" | "recommended";
};

type Db = ReturnType<typeof createServiceSupabaseClient>;

/** Map common service strings → short atmosphere tags for compare/cards. */
const SERVICE_TAG_HINTS: { match: RegExp; tag: string }[] = [
  { match: /wifi|wi-?fi|internet/i, tag: "Wifi" },
  { match: /lavatrice|washer|washing/i, tag: "Lavatrice" },
  { match: /asciugatrice|dryer/i, tag: "Asciugatrice" },
  { match: /riscaldamento|heating/i, tag: "Riscaldamento" },
  { match: /aria.?condizionata|a\/?c|climatizz/i, tag: "Aria cond." },
  { match: /balcone|terraz|balcony/i, tag: "Balcone" },
  { match: /parcheggio|garage|parking/i, tag: "Parcheggio" },
  { match: /cucina|kitchen/i, tag: "Cucina" },
  { match: /scrivania|desk/i, tag: "Scrivania" },
];

export function deriveAtmosphereTags(input: {
  amenities: string[];
  privateBathroom: boolean | null;
  furnished: boolean | null;
}): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  function push(tag: string) {
    if (seen.has(tag)) return;
    seen.add(tag);
    tags.push(tag);
  }

  if (input.privateBathroom) push("Bagno privato");
  if (input.furnished) push("Arredata");

  for (const raw of input.amenities) {
    for (const { match, tag } of SERVICE_TAG_HINTS) {
      if (match.test(raw)) push(tag);
    }
  }

  return tags.slice(0, 4);
}

function asProperty(raw: unknown): {
  id: string;
  zone: string | null;
  city: string | null;
  status: string;
  contract_type: string | null;
  deposit_amount: number | null;
  is_furnished: boolean | null;
  owner_id: string;
  guaranteed_rent: boolean | null;
  has_elevator: boolean | null;
  total_rooms: number | null;
  heating_type: string | null;
  min_contract_months: number | null;
  pets_allowed: boolean | null;
  smoking_allowed: boolean | null;
} {
  const p = Array.isArray(raw) ? raw[0] : raw;
  return p as ReturnType<typeof asProperty>;
}

function parseRoomType(
  explicit: string | null | undefined,
  contractType: string | null,
  label: string,
): RoomType | null {
  if (explicit === "singola" || explicit === "doppia" || explicit === "dus") {
    return explicit;
  }
  const l = label.toLowerCase();
  if (/uso\s*singola|\bdus\b|doppia\s+uso/.test(l)) return "dus";
  if (/doppia|double|shared/.test(l)) return "doppia";
  if (/singola|single/.test(l)) return "singola";
  if (contractType === "stanza_singola") return "singola";
  if (contractType === "stanza_doppia") return "doppia";
  return null;
}

function parseHeatingType(
  explicit: string | null | undefined,
  amenities: string[],
): HeatingType | null {
  if (explicit === "autonomo" || explicit === "centralizzato") return explicit;
  const joined = amenities.join(" ").toLowerCase();
  if (/centralizz/.test(joined)) return "centralizzato";
  if (/autonom/.test(joined)) return "autonomo";
  return null;
}

function amenityHas(amenities: string[], pattern: RegExp): boolean {
  return amenities.some((a) => pattern.test(a));
}

export function listingHasFeature(
  listing: Listing,
  feature: string,
): boolean {
  const amenities = listing.amenities ?? [];
  switch (feature) {
    case "bagno":
      return listing.privateBathroom === true;
    case "arredata":
      return listing.furnished === true;
    case "lavatrice":
      return amenityHas(amenities, /lavatrice|washer|washing/i);
    case "wifi":
      return amenityHas(amenities, /wifi|wi-?fi|internet/i);
    case "balcone":
      return (
        listing.hasBalcony === true ||
        amenityHas(amenities, /balcone|terraz|balcony/i)
      );
    case "ascensore":
      return listing.hasElevator === true;
    case "aria":
      return amenityHas(amenities, /aria.?condizionata|a\/?c|climatizz/i);
    case "spese":
      return listing.utilitiesEstimate === 0;
    case "animali":
      return listing.petsAllowed === true;
    case "fumatori":
      return listing.smokingAllowed === true;
    case "garantito":
      return listing.guaranteedRent === true;
    case "verificato":
      return listing.landlordVerified === true;
    default:
      return false;
  }
}

export function sizeBand(sizeSqm: number | null | undefined): "s" | "m" | "l" | null {
  if (sizeSqm == null || !Number.isFinite(sizeSqm)) return null;
  if (sizeSqm <= 12) return "s";
  if (sizeSqm < 18) return "m";
  return "l";
}

export function availabilityBand(
  availableFrom: string | null | undefined,
): "subito" | "settembre" | "other" | null {
  if (!availableFrom) return "subito";
  const d = new Date(availableFrom);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  if (d <= inTwoWeeks) return "subito";
  if (d.getMonth() === 8) return "settembre"; // September = month index 8
  // Also treat late Aug / early Oct as "da settembre" for academic year
  if (d.getMonth() === 7 && d.getDate() >= 20) return "settembre";
  if (d.getMonth() === 9 && d.getDate() <= 10) return "settembre";
  return "other";
}

export async function fetchPublicListings(
  db: Db,
  filters: ListingFilters = {},
): Promise<Listing[]> {
  // Select may fail if new filter columns are not migrated yet — retry without them.
  const baseSelect = `
      id,
      room_label,
      price_monthly,
      estimated_utilities,
      has_private_bathroom,
      has_balcony,
      size_sqm,
      max_occupants,
      room_type,
      services_included,
      available_from,
      is_available,
      created_at,
      properties:property_id!inner (
        id,
        zone,
        city,
        status,
        contract_type,
        deposit_amount,
        is_furnished,
        owner_id,
        guaranteed_rent,
        has_elevator,
        total_rooms,
        heating_type,
        min_contract_months,
        pets_allowed,
        smoking_allowed
      )
    `;

  const legacySelect = `
      id,
      room_label,
      price_monthly,
      estimated_utilities,
      has_private_bathroom,
      has_balcony,
      size_sqm,
      max_occupants,
      services_included,
      available_from,
      is_available,
      created_at,
      properties:property_id!inner (
        id,
        zone,
        city,
        status,
        contract_type,
        deposit_amount,
        is_furnished,
        owner_id,
        guaranteed_rent,
        has_elevator,
        total_rooms
      )
    `;

  async function runQuery(select: string) {
    let query = db
      .from("rooms")
      .select(select)
      .eq("is_available", true)
      .eq("properties.status", "attivo")
      .limit(48);

    if (filters.sort === "price_desc") {
      query = query.order("price_monthly", { ascending: false });
    } else if (filters.sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("price_monthly", { ascending: true });
    }

    if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
      query = query.lte("price_monthly", filters.maxPrice);
    }
    if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
      query = query.gte("price_monthly", filters.minPrice);
    }
    if (filters.privateBathroom) {
      query = query.eq("has_private_bathroom", true);
    }
    if (filters.guaranteedRentOnly) {
      query = query.eq("properties.guaranteed_rent", true);
    }

    return query;
  }

  let { data, error } = await runQuery(baseSelect);
  if (error) {
    console.warn(
      "[data/listings] rich-filter columns unavailable, falling back:",
      error.message,
    );
    ({ data, error } = await runQuery(legacySelect));
  }

  if (error) {
    console.error("[data/listings]", error.message);
    throw new Error("Impossibile caricare le stanze. Riprova tra poco.");
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const propertyIds = Array.from(
    new Set(rows.map((r) => asProperty(r.properties).id).filter(Boolean)),
  );
  const ownerIds = Array.from(
    new Set(rows.map((r) => asProperty(r.properties).owner_id).filter(Boolean)),
  );

  const [{ data: images }, { data: owners }] = await Promise.all([
    propertyIds.length
      ? db
          .from("property_images")
          .select("property_id, url, sort_order")
          .in("property_id", propertyIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as { property_id: string; url: string }[] }),
    ownerIds.length
      ? db.from("users").select("id, verification_status").in("id", ownerIds)
      : Promise.resolve({ data: [] as { id: string; verification_status: string }[] }),
  ]);

  const photosByProperty = new Map<string, string[]>();
  for (const img of images ?? []) {
    const list = photosByProperty.get(img.property_id) ?? [];
    list.push(img.url);
    photosByProperty.set(img.property_id, list);
  }

  const verifiedOwners = new Set(
    (owners ?? [])
      .filter((o) => o.verification_status === "verified")
      .map((o) => o.id),
  );

  let listings: Listing[] = rows.map((row) => {
    const property = asProperty(row.properties);
    const photos = photosByProperty.get(property.id) ?? [];
    const hasRealPhoto = photos.length > 0;
    const amenities = Array.isArray(row.services_included)
      ? (row.services_included as string[])
      : [];
    const label = String(row.room_label ?? "Stanza");
    const totalRooms =
      typeof property.total_rooms === "number" ? property.total_rooms : null;
    const flatmatesCount =
      totalRooms != null && totalRooms >= 1 ? Math.max(0, totalRooms - 1) : null;

    return {
      id: String(row.id),
      propertyId: property.id,
      title: label,
      cityLabel: property.city?.trim() || "Ancona",
      neighbourhood: property.zone,
      monthlyRent: Number(row.price_monthly) || 0,
      utilitiesEstimate: Number(row.estimated_utilities) || 0,
      deposit: property.deposit_amount,
      contractType: property.contract_type,
      availableFrom: row.available_from ? String(row.available_from) : null,
      roomTypeLabel: label,
      furnished: property.is_furnished,
      privateBathroom: Boolean(row.has_private_bathroom),
      amenities,
      photoUrls: hasRealPhoto ? photos : [PLACEHOLDER_PHOTO],
      hasRealPhoto,
      landlordVerified: verifiedOwners.has(property.owner_id),
      guaranteedRent: property.guaranteed_rent === true,
      propertyStatus: property.status,
      sizeSqm:
        row.size_sqm != null && Number.isFinite(Number(row.size_sqm))
          ? Number(row.size_sqm)
          : null,
      hasBalcony: Boolean(row.has_balcony),
      maxOccupants:
        row.max_occupants != null ? Number(row.max_occupants) : null,
      hasElevator: property.has_elevator === true,
      flatmatesCount,
      roomType: parseRoomType(
        row.room_type as string | null | undefined,
        property.contract_type,
        label,
      ),
      heatingType: parseHeatingType(property.heating_type, amenities),
      minContractMonths:
        typeof property.min_contract_months === "number"
          ? property.min_contract_months
          : null,
      petsAllowed:
        typeof property.pets_allowed === "boolean"
          ? property.pets_allowed
          : null,
      smokingAllowed:
        typeof property.smoking_allowed === "boolean"
          ? property.smoking_allowed
          : null,
      createdAt: row.created_at ? String(row.created_at) : null,
      atmosphereTags: deriveAtmosphereTags({
        amenities,
        privateBathroom: Boolean(row.has_private_bathroom),
        furnished: property.is_furnished,
      }),
    };
  });

  if (filters.zone) {
    const z = filters.zone.toLowerCase();
    listings = listings.filter((l) =>
      (l.neighbourhood ?? "").toLowerCase().includes(z),
    );
  }
  if (filters.verifiedOnly) {
    listings = listings.filter((l) => l.landlordVerified);
  }
  if (filters.guaranteedRentOnly) {
    listings = listings.filter((l) => l.guaranteedRent);
  }
  if (filters.availableFromBefore) {
    const cutoff = filters.availableFromBefore;
    listings = listings.filter(
      (l) => !l.availableFrom || l.availableFrom <= cutoff,
    );
  }

  return listings;
}

export async function fetchPublicListingById(
  db: Db,
  roomId: string,
): Promise<Listing | null> {
  const all = await fetchPublicListings(db, {});
  return all.find((l) => l.id === roomId) ?? null;
}
