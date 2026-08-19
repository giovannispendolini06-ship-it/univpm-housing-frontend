import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/domain/types";

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
  sort?: "price_asc" | "price_desc" | "newest";
};

type Db = ReturnType<typeof createServiceSupabaseClient>;

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
} {
  const p = Array.isArray(raw) ? raw[0] : raw;
  return p as ReturnType<typeof asProperty>;
}

export async function fetchPublicListings(
  db: Db,
  filters: ListingFilters = {},
): Promise<Listing[]> {
  let query = db
    .from("rooms")
    .select(
      `
      id,
      room_label,
      price_monthly,
      estimated_utilities,
      has_private_bathroom,
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
        guaranteed_rent
      )
    `,
    )
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

  const { data, error } = await query;
  if (error) {
    console.error("[data/listings]", error.message);
    throw new Error("Impossibile caricare le stanze. Riprova tra poco.");
  }

  const rows = data ?? [];
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
    return {
      id: String(row.id),
      propertyId: property.id,
      title: String(row.room_label ?? "Stanza"),
      cityLabel: property.city?.trim() || "Ancona",
      neighbourhood: property.zone,
      monthlyRent: Number(row.price_monthly) || 0,
      utilitiesEstimate: Number(row.estimated_utilities) || 0,
      deposit: property.deposit_amount,
      contractType: property.contract_type,
      availableFrom: row.available_from ? String(row.available_from) : null,
      roomTypeLabel: String(row.room_label ?? "Stanza"),
      furnished: property.is_furnished,
      privateBathroom: Boolean(row.has_private_bathroom),
      amenities: Array.isArray(row.services_included)
        ? (row.services_included as string[])
        : [],
      photoUrls: hasRealPhoto ? photos : [PLACEHOLDER_PHOTO],
      hasRealPhoto,
      landlordVerified: verifiedOwners.has(property.owner_id),
      guaranteedRent: property.guaranteed_rent === true,
      propertyStatus: property.status,
      atmosphereTags: [],
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
