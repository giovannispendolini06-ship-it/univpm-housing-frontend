/**
 * Public listing helpers for presentation layer.
 * Queries live in lib/data/listings.ts.
 */
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  fetchPublicListingById,
  fetchPublicListings,
  type ListingFilters,
} from "@/lib/data/listings";
import type { Listing } from "@/lib/domain/types";
import { DEMO_STANZE_LISTINGS } from "@/lib/demo-stanze-listings";

export type { ListingFilters };

export async function listPublicListings(
  filters: ListingFilters = {},
): Promise<Listing[]> {
  const db = createServiceSupabaseClient();
  return fetchPublicListings(db, filters);
}

export async function getPublicListing(roomId: string): Promise<Listing | null> {
  const id = roomId?.trim();
  if (!id) return null;

  try {
    const db = createServiceSupabaseClient();
    const listing = await fetchPublicListingById(db, id);
    if (listing) return listing;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[listings] getPublicListing fallback to demo:",
        err instanceof Error ? err.message : err,
      );
    } else {
      throw err;
    }
  }

  // Dev / offline: allow demo cards from /stanze to open detail pages.
  if (process.env.NODE_ENV === "development") {
    return DEMO_STANZE_LISTINGS.find((l) => l.id === id) ?? null;
  }

  return null;
}
