"use server";

import { revalidatePath } from "next/cache";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getOptionalSession, requireRole } from "@/lib/auth/session";
import {
  getApplicationOwnedByOwner,
  upsertStudentApplication,
  updateApplicationStatus,
} from "@/lib/data/applications";
import { ensurePeerConversation } from "@/lib/data/messages";
import { sendEmail, buildApplicationStatusEmail } from "@/lib/email";

export type ApplyResult =
  | { ok: true; applicationId: string }
  | {
      ok: false;
      error: string;
      code?: "unauthenticated" | "forbidden" | "duplicate" | "unavailable";
    };

export async function submitRoomApplication(input: {
  roomId: string;
  message?: string;
}): Promise<ApplyResult> {
  const roomId = input.roomId?.trim();
  if (!roomId) return { ok: false, error: "Stanza non valida." };

  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi o registrati per candidarti a questa stanza.",
      code: "unauthenticated",
    };
  }

  if (session.role !== "student") {
    return {
      ok: false,
      error: "Solo gli account studente possono candidarsi.",
      code: "forbidden",
    };
  }

  const db = createServiceSupabaseClient();

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

  const { data, error } = await upsertStudentApplication(db, {
    roomId,
    studentId: session.id,
    message,
  });

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
  revalidatePath("/host/properties");

  return { ok: true, applicationId: data.id };
}

export async function setApplicationStatus(input: {
  applicationId: string;
  status: "under_review" | "accepted" | "rejected";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const owner = await requireRole(["owner", "admin"]);
  const db = createServiceSupabaseClient();

  if (owner.role === "owner") {
    const owned = await getApplicationOwnedByOwner(db, input.applicationId, owner.id);
    if (!owned.data) {
      return { ok: false, error: "Candidatura non trovata o non di tua competenza." };
    }
  }

  const { data, error } = await updateApplicationStatus(db, {
    applicationId: input.applicationId,
    status: input.status,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Aggiornamento non riuscito." };
  }

  // On accept: open peer conversation architecture (best-effort)
  if (input.status === "accepted") {
    try {
      const { data: roomRow } = await db
        .from("rooms")
        .select("id, properties:property_id ( owner_id )")
        .eq("id", data.room_id)
        .maybeSingle();
      const prop = Array.isArray(roomRow?.properties)
        ? roomRow?.properties[0]
        : roomRow?.properties;
      const landlordId =
        (prop as { owner_id?: string } | null | undefined)?.owner_id ?? owner.id;
      await ensurePeerConversation(db, {
        listingId: data.room_id,
        applicationId: data.id,
        participantIds: [landlordId, data.student_id],
      });
    } catch (err) {
      console.error("[applications] conversation", err);
    }
  }

  // Notify student (best-effort)
  try {
    const { data: student } = await db
      .from("users")
      .select("email, full_name")
      .eq("id", data.student_id)
      .single();
    if (student?.email) {
      const statusLabel =
        input.status === "accepted"
          ? "accettata"
          : input.status === "rejected"
            ? "rifiutata"
            : "in revisione";
      const mail = buildApplicationStatusEmail({
        fullName: student.full_name ?? "",
        statusLabel,
      });
      await sendEmail({ to: student.email, ...mail });
    }
  } catch (err) {
    console.error("[applications] notify", err);
  }

  revalidatePath("/applications");
  revalidatePath("/owner");
  revalidatePath("/host/properties");
  revalidatePath("/messages");
  revalidatePath(`/stanza/${data.room_id}`);

  return { ok: true };
}
