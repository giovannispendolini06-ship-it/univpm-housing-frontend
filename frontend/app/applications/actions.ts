"use server";

import { revalidatePath } from "next/cache";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getOptionalSession, requireRole } from "@/lib/auth/session";
import {
  acceptApplicationAndOpenTenancy,
  getApplicationOwnedByOwner,
  upsertStudentApplication,
  updateApplicationStatus,
} from "@/lib/data/applications";
import { ensurePeerConversation } from "@/lib/data/messages";
import {
  sendEmail,
  buildApplicationStatusEmail,
  buildNewApplicationOwnerEmail,
} from "@/lib/email";
import { isSeekerRole } from "@/lib/auth/roles";

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

  if (!isSeekerRole(session.role)) {
    return {
      ok: false,
      error: "Solo studenti e lavoratori possono candidarsi.",
      code: "forbidden",
    };
  }

  const db = createServiceSupabaseClient();

  const { data: room } = await db
    .from("rooms")
    .select(
      `
      id, is_available, room_label, price_monthly,
      properties:property_id!inner ( status, owner_id, zone, address )
    `,
    )
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

  const { data: existing } = await db
    .from("room_applications")
    .select("id, status")
    .eq("room_id", roomId)
    .eq("student_id", session.id)
    .maybeSingle();

  if (
    existing &&
    (existing.status === "submitted" ||
      existing.status === "under_review" ||
      existing.status === "accepted")
  ) {
    return {
      ok: false,
      error:
        existing.status === "accepted"
          ? "Hai già una candidatura accettata per questa stanza."
          : "Hai già una candidatura in corso per questa stanza.",
      code: "duplicate",
    };
  }

  const message = (input.message ?? "").trim().slice(0, 1000) || null;

  const { data, error } = await upsertStudentApplication(db, {
    roomId,
    studentId: session.id,
    message,
  });

  if (error || !data) {
    console.error("[applications]", error?.message);
    return {
      ok: false,
      error:
        "Non siamo riusciti a salvare la candidatura. Se il problema continua, scrivi a info@coabito.it.",
    };
  }

  try {
    const ownerId = (property as { owner_id?: string } | null)?.owner_id;
    if (ownerId) {
      const [{ data: ownerRow }, { data: applicant }] = await Promise.all([
        db.from("users").select("email, full_name").eq("id", ownerId).maybeSingle(),
        db.from("users").select("full_name").eq("id", session.id).maybeSingle(),
      ]);
      if (ownerRow?.email) {
        await sendEmail({
          to: ownerRow.email,
          ...buildNewApplicationOwnerEmail({
            ownerName: ownerRow.full_name ?? "",
            applicantName: applicant?.full_name ?? "Un candidato",
            roomLabel: String(room.room_label ?? "Stanza"),
            zone:
              (property as { zone?: string | null } | null)?.zone ??
              (property as { address?: string | null } | null)?.address ??
              null,
            message,
          }),
        });
      }
    }
  } catch (err) {
    console.error("[applications] owner notify", err);
  }

  revalidatePath("/stanze");
  revalidatePath(`/stanza/${roomId}`);
  revalidatePath("/applications");
  revalidatePath("/owner");

  return { ok: true, applicationId: data.id };
}

export async function setApplicationStatus(input: {
  applicationId: string;
  status: "under_review" | "accepted" | "rejected";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireRole(["owner", "admin"]);
  const db = createServiceSupabaseClient();

  if (actor.role === "owner") {
    const owned = await getApplicationOwnedByOwner(
      db,
      input.applicationId,
      actor.id,
    );
    if (!owned.data) {
      return {
        ok: false,
        error: "Candidatura non trovata o non di tua competenza.",
      };
    }
  }

  if (input.status === "accepted") {
    let ownerId = actor.id;
    if (actor.role === "admin") {
      const { data: appRow } = await db
        .from("room_applications")
        .select(
          `id, rooms:room_id!inner ( properties:property_id!inner ( owner_id ) )`,
        )
        .eq("id", input.applicationId)
        .maybeSingle();
      const room = Array.isArray(appRow?.rooms) ? appRow?.rooms[0] : appRow?.rooms;
      const propRaw = room
        ? (room as { properties?: unknown }).properties
        : null;
      const prop = Array.isArray(propRaw) ? propRaw[0] : propRaw;
      ownerId =
        (prop as { owner_id?: string } | null | undefined)?.owner_id ?? actor.id;
    }

    const result = await acceptApplicationAndOpenTenancy(db, {
      applicationId: input.applicationId,
      actorOwnerId: ownerId,
    });
    if (!result.ok) return result;

    try {
      await ensurePeerConversation(db, {
        listingId: result.roomId,
        applicationId: input.applicationId,
        participantIds: [ownerId, result.studentId],
      });
    } catch (err) {
      console.error("[applications] conversation", err);
    }

    try {
      const notifyIds = [
        result.studentId,
        ...result.rejected.map((r) => r.studentId),
      ];
      const { data: users } = await db
        .from("users")
        .select("id, email, full_name")
        .in("id", notifyIds);
      const byId = new Map((users ?? []).map((u) => [String(u.id), u]));

      const acceptedUser = byId.get(result.studentId);
      if (acceptedUser?.email) {
        await sendEmail({
          to: acceptedUser.email,
          ...buildApplicationStatusEmail({
            fullName: acceptedUser.full_name ?? "",
            statusLabel: "accettata",
          }),
        });
      }
      for (const rej of result.rejected) {
        const u = byId.get(rej.studentId);
        if (!u?.email) continue;
        await sendEmail({
          to: u.email,
          ...buildApplicationStatusEmail({
            fullName: u.full_name ?? "",
            statusLabel: "rifiutata",
          }),
        });
      }
    } catch (err) {
      console.error("[applications] notify accept", err);
    }

    revalidatePath("/applications");
    revalidatePath("/owner");
    revalidatePath("/messages");
    revalidatePath(`/stanza/${result.roomId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  }

  const { data, error } = await updateApplicationStatus(db, {
    applicationId: input.applicationId,
    status: input.status,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Aggiornamento non riuscito." };
  }

  try {
    const { data: student } = await db
      .from("users")
      .select("email, full_name")
      .eq("id", data.student_id)
      .single();
    if (student?.email) {
      const statusLabel =
        input.status === "rejected" ? "rifiutata" : "in revisione";
      await sendEmail({
        to: student.email,
        ...buildApplicationStatusEmail({
          fullName: student.full_name ?? "",
          statusLabel,
        }),
      });
    }
  } catch (err) {
    console.error("[applications] notify", err);
  }

  revalidatePath("/applications");
  revalidatePath("/owner");
  revalidatePath("/messages");
  revalidatePath(`/stanza/${data.room_id}`);

  return { ok: true };
}
