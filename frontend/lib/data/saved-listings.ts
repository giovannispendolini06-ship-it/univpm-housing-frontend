import type { SupabaseClient } from "@supabase/supabase-js";

export async function listSavedRoomIds(
  db: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await db
    .from("saved_listings")
    .select("room_id")
    .eq("user_id", userId);

  if (error) {
    console.error("[saved_listings] list", error.message);
    return [];
  }
  return (data ?? []).map((row) => String(row.room_id));
}

export async function isRoomSaved(
  db: SupabaseClient,
  userId: string,
  roomId: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("saved_listings")
    .select("room_id")
    .eq("user_id", userId)
    .eq("room_id", roomId)
    .maybeSingle();

  if (error) {
    console.error("[saved_listings] isSaved", error.message);
    return false;
  }
  return Boolean(data);
}

export async function insertSavedListing(
  db: SupabaseClient,
  userId: string,
  roomId: string,
): Promise<{ error: string | null }> {
  const { error } = await db.from("saved_listings").upsert(
    { user_id: userId, room_id: roomId },
    { onConflict: "user_id,room_id", ignoreDuplicates: true },
  );
  return { error: error?.message ?? null };
}

export async function deleteSavedListing(
  db: SupabaseClient,
  userId: string,
  roomId: string,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from("saved_listings")
    .delete()
    .eq("user_id", userId)
    .eq("room_id", roomId);
  return { error: error?.message ?? null };
}
