"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { isSeekerRole } from "@/lib/auth/roles";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  expressRoommateInterest,
  getOpenToGroupMatching,
  listMatchedRoommateIds,
  listRoommateSuggestions,
  passRoommate,
  setOpenToGroupMatching,
} from "@/lib/data/roommates";

export async function toggleOpenToGroupMatching(open: boolean) {
  const session = await requireSession();
  if (!isSeekerRole(session.role)) {
    return { ok: false as const, error: "Solo gli studenti possono attivare il matching." };
  }
  const db = createServiceSupabaseClient();
  const { error } = await setOpenToGroupMatching(db, session.id, open);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/coinquilini");
  revalidatePath("/profilo");
  return { ok: true as const, open };
}

export async function interestInRoommateAction(targetUserId: string) {
  const session = await requireSession();
  if (!isSeekerRole(session.role)) {
    return { ok: false as const, error: "Non autorizzato." };
  }
  const db = createServiceSupabaseClient();
  const result = await expressRoommateInterest(db, session.id, targetUserId);
  if (!result.ok) return result;
  revalidatePath("/coinquilini");
  revalidatePath("/messages");
  return result;
}

export async function passRoommateAction(targetUserId: string) {
  const session = await requireSession();
  if (!isSeekerRole(session.role)) {
    return { ok: false as const, error: "Non autorizzato." };
  }
  const db = createServiceSupabaseClient();
  const result = await passRoommate(db, session.id, targetUserId);
  if (!result.ok) return result;
  revalidatePath("/coinquilini");
  return result;
}

export async function submitGroupRoomApplication(input: {
  roomId: string;
  message?: string;
  coApplicantIds?: string[];
}) {
  const session = await requireSession();
  if (!isSeekerRole(session.role)) {
    return { ok: false as const, error: "Solo gli studenti possono candidarsi." };
  }

  const roomId = input.roomId?.trim();
  if (!roomId) return { ok: false as const, error: "Stanza non valida." };

  const db = createServiceSupabaseClient();
  const matchedIds = await listMatchedRoommateIds(db, session.id);
  const requested = Array.from(
    new Set((input.coApplicantIds ?? []).map((id) => id.trim()).filter(Boolean)),
  );

  for (const id of requested) {
    if (!matchedIds.includes(id)) {
      return {
        ok: false as const,
        error: "Puoi includere solo coinquilini con match reciproco confermato.",
      };
    }
  }

  if (requested.length === 0) {
    return {
      ok: false as const,
      error: "Seleziona almeno un coinquilino matchato, oppure candidati da solo dalla scheda stanza.",
    };
  }

  const { data: room } = await db
    .from("rooms")
    .select("id, is_available, properties:property_id!inner ( status )")
    .eq("id", roomId)
    .maybeSingle();
  const property = Array.isArray(room?.properties) ? room?.properties[0] : room?.properties;
  if (!room || !room.is_available || property?.status !== "attivo") {
    return { ok: false as const, error: "Questa stanza non è al momento disponibile." };
  }

  const groupId = crypto.randomUUID();
  const message =
    (input.message ?? "").trim().slice(0, 1000) ||
    `Candidatura di gruppo (${requested.length + 1} studenti, match Coabito).`;

  const applicantIds = [session.id, ...requested];
  const applicationIds: string[] = [];

  for (const studentId of applicantIds) {
    const { data, error } = await db
      .from("room_applications")
      .upsert(
        {
          room_id: roomId,
          student_id: studentId,
          status: "submitted",
          message,
          group_id: groupId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "room_id,student_id" },
      )
      .select("id")
      .single();

    if (error || !data) {
      return {
        ok: false as const,
        error:
          error?.message?.includes("group_id")
            ? "Applica la migration roommate matching (colonna group_id) su Supabase."
            : error?.message ?? "Candidatura di gruppo non salvata.",
      };
    }
    applicationIds.push(String(data.id));
  }

  revalidatePath("/stanze");
  revalidatePath(`/stanza/${roomId}`);
  revalidatePath("/applications");
  revalidatePath("/coinquilini");

  return { ok: true as const, groupId, applicationIds };
}
