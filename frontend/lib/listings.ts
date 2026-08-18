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

export type { ListingFilters };

export async function listPublicListings(
  filters: ListingFilters = {},
): Promise<Listing[]> {
  const db = createServiceSupabaseClient();
  return fetchPublicListings(db, filters);
}

export async function getPublicListing(roomId: string): Promise<Listing | null> {
  const db = createServiceSupabaseClient();
  return fetchPublicListingById(db, roomId);
}
