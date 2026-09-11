import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/domain/types";

type Db = ReturnType<typeof createServiceSupabaseClient>;

export async function upsertStudentApplication(
  db: Db,
  input: { roomId: string; studentId: string; message: string | null },
) {
  return db
    .from("room_applications")
    .upsert(
      {
        room_id: input.roomId,
        student_id: input.studentId,
        status: "submitted",
        message: input.message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id,student_id" },
    )
    .select("id")
    .single();
}

export async function listApplicationsForStudent(db: Db, studentId: string) {
  return db
    .from("room_applications")
    .select(
      `
      id, status, message, created_at, updated_at,
      rooms:room_id (
        id, room_label, price_monthly,
        properties:property_id ( zone, city, deposit_amount, escrow_coverage, guaranteed_rent )
      )
    `,
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
}

export async function listApplicationsForOwnerRooms(db: Db, roomIds: string[]) {
  if (roomIds.length === 0) return { data: [], error: null };
  return db
    .from("room_applications")
    .select(
      `
      id, status, created_at, message, room_id,
      rooms:room_id ( room_label ),
      users:student_id ( id, full_name, verification_status, email )
    `,
    )
    .in("room_id", roomIds)
    .order("created_at", { ascending: false })
    .limit(50);
}

export async function updateApplicationStatus(
  db: Db,
  input: {
    applicationId: string;
    status: Extract<ApplicationStatus, "under_review" | "accepted" | "rejected" | "withdrawn">;
  },
) {
  const decided =
    input.status === "accepted" || input.status === "rejected"
      ? new Date().toISOString()
      : null;
  return db
    .from("room_applications")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
      ...(decided ? { decided_at: decided } : {}),
    })
    .eq("id", input.applicationId)
    .select("id, room_id, student_id, status")
    .single();
}

export type AcceptApplicationResult =
  | {
      ok: true;
      tenancyId: string;
      closedLeaseId: string;
      rejected: { id: string; studentId: string }[];
      roomId: string;
      studentId: string;
    }
  | { ok: false; error: string };

/**
 * Accept → room_tenancies + closed_leases, reject other pending apps,
 * mark room unavailable. Uses service-role client (caller must authorize).
 */
export async function acceptApplicationAndOpenTenancy(
  db: Db,
  input: { applicationId: string; actorOwnerId: string },
): Promise<AcceptApplicationResult> {
  const owned = await getApplicationOwnedByOwner(
    db,
    input.applicationId,
    input.actorOwnerId,
  );
  if (!owned.data) {
    return { ok: false, error: "Candidatura non trovata o non di tua competenza." };
  }

  const app = owned.data;
  if (app.status === "accepted") {
    return { ok: false, error: "Questa candidatura è già stata accettata." };
  }
  if (app.status === "withdrawn") {
    return { ok: false, error: "Il candidato ha ritirato la candidatura." };
  }

  const { data: room } = await db
    .from("rooms")
    .select("id, price_monthly, is_available, property_id")
    .eq("id", app.room_id)
    .maybeSingle();
  if (!room) return { ok: false, error: "Stanza non trovata." };

  const monthlyRent = Number(room.price_monthly);
  if (!Number.isFinite(monthlyRent) || monthlyRent < 0) {
    return { ok: false, error: "Prezzo stanza non valido." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  // Reuse active tenancy if this student is already on the room
  const { data: existingTenancy } = await db
    .from("room_tenancies")
    .select("id")
    .eq("room_id", app.room_id)
    .eq("student_id", app.student_id)
    .is("ended_at", null)
    .maybeSingle();

  let tenancyId = existingTenancy?.id as string | undefined;
  if (!tenancyId) {
    const { data: tenancy, error: tenancyError } = await db
      .from("room_tenancies")
      .insert({
        room_id: app.room_id,
        student_id: app.student_id,
        started_at: today,
      })
      .select("id")
      .single();

    if (tenancyError || !tenancy) {
      return {
        ok: false,
        error: tenancyError?.message ?? "Impossibile creare la tenancy.",
      };
    }
    tenancyId = String(tenancy.id);
  }

  await db.from("rooms").update({ is_available: false }).eq("id", app.room_id);

  const { error: acceptError } = await db
    .from("room_applications")
    .update({
      status: "accepted",
      decided_at: now,
      updated_at: now,
    })
    .eq("id", input.applicationId);

  if (acceptError) {
    return { ok: false, error: acceptError.message };
  }

  const { data: siblings } = await db
    .from("room_applications")
    .select("id, student_id")
    .eq("room_id", app.room_id)
    .in("status", ["submitted", "under_review", "draft"])
    .neq("id", input.applicationId);

  const rejected = (siblings ?? []).map((s) => ({
    id: String(s.id),
    studentId: String(s.student_id),
  }));
  if (rejected.length > 0) {
    await db
      .from("room_applications")
      .update({
        status: "rejected",
        decided_at: now,
        updated_at: now,
      })
      .in(
        "id",
        rejected.map((r) => r.id),
      );
  }

  const { data: existingClosed } = await db
    .from("closed_leases")
    .select("id")
    .eq("application_id", input.applicationId)
    .maybeSingle();

  let closedLeaseId = existingClosed?.id as string | undefined;
  if (!closedLeaseId) {
    const { data: closed, error: closedError } = await db
      .from("closed_leases")
      .insert({
        tenancy_id: tenancyId,
        room_id: app.room_id,
        application_id: input.applicationId,
        owner_id: input.actorOwnerId,
        monthly_rent: monthlyRent,
        closed_at: now,
      })
      .select("id")
      .single();

    if (closedError || !closed) {
      return {
        ok: false,
        error: closedError?.message ?? "Tenancy creata ma closed_leases fallito.",
      };
    }
    closedLeaseId = String(closed.id);
  }

  return {
    ok: true,
    tenancyId,
    closedLeaseId,
    rejected,
    roomId: String(app.room_id),
    studentId: String(app.student_id),
  };
}

export async function getApplicationOwnedByOwner(
  db: Db,
  applicationId: string,
  ownerId: string,
) {
  return db
    .from("room_applications")
    .select(
      `
      id, status, room_id, student_id,
      rooms:room_id!inner (
        id,
        properties:property_id!inner ( owner_id )
      )
    `,
    )
    .eq("id", applicationId)
    .maybeSingle()
    .then((res) => {
      if (res.error || !res.data) return res;
      const room = Array.isArray(res.data.rooms) ? res.data.rooms[0] : res.data.rooms;
      const propertyRaw = room
        ? (room as { properties?: unknown }).properties
        : null;
      const property = Array.isArray(propertyRaw)
        ? (propertyRaw[0] as { owner_id?: string } | undefined)
        : (propertyRaw as { owner_id?: string } | null | undefined);
      if (!property || property.owner_id !== ownerId) {
        return { data: null, error: res.error };
      }
      return res;
    });
}
