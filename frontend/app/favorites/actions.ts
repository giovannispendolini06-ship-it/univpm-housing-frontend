"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getOptionalSession } from "@/lib/auth/session";
import {
  deleteSavedListing,
  insertSavedListing,
  isRoomSaved,
  listSavedRoomIds,
} from "@/lib/data/saved-listings";

export type FavoriteResult =
  | { ok: true; saved: boolean }
  | {
      ok: false;
      error: string;
      code: "unauthenticated" | "forbidden" | "not_found" | "error";
    };

async function assertRoomIsPublic(roomId: string): Promise<boolean> {
  // Demo listings used when Supabase is offline in development
  if (process.env.NODE_ENV === "development" && roomId.startsWith("demo-")) {
    return true;
  }

  const db = createServiceSupabaseClient();
  const { data } = await db
    .from("rooms")
    .select("id, is_available, properties:property_id!inner ( status )")
    .eq("id", roomId)
    .maybeSingle();

  const property = Array.isArray(data?.properties)
    ? data?.properties[0]
    : data?.properties;

  return Boolean(
    data && data.is_available && (property as { status?: string } | null)?.status === "attivo",
  );
}

/** Toggle preferito. Anon → unauthenticated (UI redirects to login). */
export async function toggleFavorite(roomId: string): Promise<FavoriteResult> {
  const id = roomId?.trim();
  if (!id) return { ok: false, error: "Stanza non valida.", code: "not_found" };

  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi per salvare gli annunci nei preferiti.",
      code: "unauthenticated",
    };
  }

  if (!(await assertRoomIsPublic(id))) {
    return {
      ok: false,
      error: "Questa stanza non è disponibile.",
      code: "not_found",
    };
  }

  // Prefer authenticated client so RLS is enforced; service role as fallback
  // only when user JWT client cannot write (e.g. missing grants) — still keyed by session.id.
  const auth = await createServerSupabaseClient();
  const db = auth;
  const saved = await isRoomSaved(db, session.id, id);

  if (saved) {
    const { error } = await deleteSavedListing(db, session.id, id);
    if (error) {
      const service = createServiceSupabaseClient();
      const retry = await deleteSavedListing(service, session.id, id);
      if (retry.error) {
        console.error("[favorites] delete", retry.error);
        return { ok: false, error: "Non siamo riusciti a rimuovere il preferito.", code: "error" };
      }
    }
    revalidatePath("/stanze");
    revalidatePath(`/stanza/${id}`);
    revalidatePath("/preferiti");
    return { ok: true, saved: false };
  }

  const { error } = await insertSavedListing(db, session.id, id);
  if (error) {
    const service = createServiceSupabaseClient();
    const retry = await insertSavedListing(service, session.id, id);
    if (retry.error) {
      console.error("[favorites] insert", retry.error);
      return { ok: false, error: "Non siamo riusciti a salvare il preferito.", code: "error" };
    }
  }

  revalidatePath("/stanze");
  revalidatePath(`/stanza/${id}`);
  revalidatePath("/preferiti");
  return { ok: true, saved: true };
}

/** Idempotent add — used after login resume (?action=favorite). */
export async function addFavorite(roomId: string): Promise<FavoriteResult> {
  const id = roomId?.trim();
  if (!id) return { ok: false, error: "Stanza non valida.", code: "not_found" };

  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi per salvare gli annunci nei preferiti.",
      code: "unauthenticated",
    };
  }

  if (!(await assertRoomIsPublic(id))) {
    return {
      ok: false,
      error: "Questa stanza non è disponibile.",
      code: "not_found",
    };
  }

  const auth = await createServerSupabaseClient();
  const already = await isRoomSaved(auth, session.id, id);
  if (already) return { ok: true, saved: true };

  const { error } = await insertSavedListing(auth, session.id, id);
  if (error) {
    const service = createServiceSupabaseClient();
    const retry = await insertSavedListing(service, session.id, id);
    if (retry.error) {
      return { ok: false, error: "Non siamo riusciti a salvare il preferito.", code: "error" };
    }
  }

  revalidatePath("/preferiti");
  revalidatePath(`/stanza/${id}`);
  return { ok: true, saved: true };
}

export async function getSavedRoomIdsForCurrentUser(): Promise<string[]> {
  const session = await getOptionalSession();
  if (!session) return [];
  const db = createServiceSupabaseClient();
  return listSavedRoomIds(db, session.id);
}

export async function isRoomSavedForCurrentUser(roomId: string): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;
  const db = createServiceSupabaseClient();
  return isRoomSaved(db, session.id, roomId);
}
