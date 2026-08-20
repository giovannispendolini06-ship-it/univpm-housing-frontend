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
  return db
    .from("room_applications")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.applicationId)
    .select("id, room_id, student_id, status")
    .single();
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
