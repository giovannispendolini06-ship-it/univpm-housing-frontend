"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export type ApplyResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string; code?: "unauthenticated" | "forbidden" | "duplicate" | "unavailable" };

export async function submitRoomApplication(input: {
  roomId: string;
  message?: string;
}): Promise<ApplyResult> {
  const roomId = input.roomId?.trim();
  if (!roomId) return { ok: false, error: "Stanza non valida." };

  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "Accedi o registrati per candidarti a questa stanza.",
      code: "unauthenticated",
    };
  }

  const db = createServiceSupabaseClient();

  const { data: profile } = await db
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    return {
      ok: false,
      error: "Solo gli account studente possono candidarsi.",
      code: "forbidden",
    };
  }

  const { data: room } = await db
    .from("rooms")
    .select("id, is_available, properties:property_id!inner ( status )")
    .eq("id", roomId)
    .maybeSingle();

  const property = Array.isArray(room?.properties)
    ? room?.properties[0]
    : room?.properties;

  if (!room || !room.is_available || property?.status !== "attivo") {
    return {
      ok: false,
      error: "Questa stanza non è al momento disponibile.",
      code: "unavailable",
    };
  }

  const message = (input.message ?? "").trim().slice(0, 1000) || null;

  const { data, error } = await db
    .from("room_applications")
    .upsert(
      {
        room_id: roomId,
        student_id: user.id,
        status: "submitted",
        message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id,student_id" },
    )
    .select("id")
    .single();

  if (error) {
    console.error("[applications]", error.message);
    return {
      ok: false,
      error:
        "Non siamo riusciti a salvare la candidatura. Se il problema continua, scrivi a info@coabito.it.",
    };
  }

  revalidatePath("/stanze");
  revalidatePath(`/stanza/${roomId}`);
  revalidatePath("/applications");
  revalidatePath("/owner");

  return { ok: true, applicationId: data.id };
}
