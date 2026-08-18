import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/domain/types";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop";

export type ListingFilters = {
  maxPrice?: number;
  zone?: string;
  verifiedOnly?: boolean;
};

/**
 * Public marketplace listings. Uses service role server-side and strips
 * private addresses. Empty inventory → empty array (honest empty state).
 */
export async function listPublicListings(
  filters: ListingFilters = {},
): Promise<Listing[]> {
  const db = createServiceSupabaseClient();

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
      properties:property_id!inner (
        id,
        zone,
        city,
        status,
        contract_type,
        deposit_amount,
        is_furnished,
        owner_id
      )
    `,
    )
    .eq("is_available", true)
    .eq("properties.status", "attivo")
    .order("price_monthly", { ascending: true })
    .limit(48);

  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    query = query.lte("price_monthly", filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listings] listPublicListings", error.message);
    throw new Error("Impossibile caricare le stanze. Riprova tra poco.");
  }

  const rows = data ?? [];
  const propertyIds = Array.from(
    new Set(rows.map((r: { properties: { id: string } | { id: string }[] }) => {
      const p = Array.isArray(r.properties) ? r.properties[0] : r.properties;
      return p?.id;
    }).filter(Boolean)),
  ) as string[];

  const ownerIds = Array.from(
    new Set(
      rows
        .map((r: { properties: { owner_id?: string } | { owner_id?: string }[] }) => {
          const p = Array.isArray(r.properties) ? r.properties[0] : r.properties;
          return p?.owner_id;
        })
        .filter(Boolean),
    ),
  ) as string[];

  const [{ data: images }, { data: owners }] = await Promise.all([
    propertyIds.length
      ? db
          .from("property_images")
          .select("property_id, url, sort_order")
          .in("property_id", propertyIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as { property_id: string; url: string }[] }),
    ownerIds.length
      ? db
          .from("users")
          .select("id, verification_status")
          .in("id", ownerIds)
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

  let listings: Listing[] = rows.map((row: Record<string, unknown>) => {
    const property = (Array.isArray(row.properties)
      ? row.properties[0]
      : row.properties) as {
      id: string;
      zone: string | null;
      city: string | null;
      status: string;
      contract_type: string | null;
      deposit_amount: number | null;
      is_furnished: boolean | null;
      owner_id: string;
    };

    const photos = photosByProperty.get(property.id) ?? [];
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
      photoUrls: photos.length > 0 ? photos : [PLACEHOLDER_PHOTO],
      landlordVerified: verifiedOwners.has(property.owner_id),
      propertyStatus: property.status,
    } satisfies Listing;
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

  return listings;
}

export async function getPublicListing(roomId: string): Promise<Listing | null> {
  const all = await listPublicListings();
  return all.find((l) => l.id === roomId) ?? null;
}
