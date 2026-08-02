import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Room } from "@/lib/types";
import { MOCK_ROOMS } from "@/lib/mock-data";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} non configurata`);
  }
  return value;
}

/** Client con anon key (rispetta RLS; usare con sessione utente quando disponibile). */
export function createSupabaseAuthClient(accessToken?: string): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client service role — solo lato server, bypassa RLS. */
export function createSupabaseServiceClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapRoomRow(row: Record<string, unknown>): Room {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    city: String(row.city ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    rentMonthly: Number(row.rent_monthly ?? 0),
    availableFrom: String(row.available_from ?? ""),
    beds: Number(row.beds ?? 1),
    amenities: (row.amenities as string[]) ?? [],
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    lifestyleTags: (row.lifestyle_tags as string[]) ?? [],
    cleanliness: Number(row.cleanliness ?? 3),
    noiseLevel: Number(row.noise_level ?? 3),
    petsAllowed: Boolean(row.pets_allowed),
    smokingAllowed: Boolean(row.smoking_allowed),
    description: String(row.description ?? ""),
  };
}

export async function fetchAvailableRooms(
  city?: string,
): Promise<Room[]> {
  const useMock =
    process.env.USE_MOCK_DATA === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (useMock) {
    if (!city) return MOCK_ROOMS;
    return MOCK_ROOMS.filter(
      (r) => r.city.toLowerCase() === city.toLowerCase(),
    );
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("rooms")
    .select(
      "id, title, city, neighborhood, rent_monthly, available_from, beds, amenities, image_url, lifestyle_tags, cleanliness, noise_level, pets_allowed, smoking_allowed, description",
    )
    .eq("is_available", true)
    .order("rent_monthly", { ascending: true });

  if (city) {
    query = query.ilike("city", city);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase rooms error:", error.message);
    return MOCK_ROOMS;
  }

  return (data ?? []).map((row) => mapRoomRow(row as Record<string, unknown>));
}
