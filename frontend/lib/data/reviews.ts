import type { SupabaseClient } from "@supabase/supabase-js";

export type ReviewTargetType = "landlord" | "student";

export type ReviewRow = {
  id: string;
  tenancy_id: string;
  author_id: string;
  target_type: ReviewTargetType;
  target_id: string;
  room_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type ReviewPublic = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorDisplayName: string | null;
};

export const VERIFIED_REVIEW_THRESHOLD = 3;

export async function listLandlordReviewsForRoom(
  db: SupabaseClient,
  roomId: string,
): Promise<ReviewPublic[]> {
  const { data, error } = await db
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      users:author_id ( full_name )
    `,
    )
    .eq("room_id", roomId)
    .eq("target_type", "landlord")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[reviews] listLandlordReviewsForRoom", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const author = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: String(row.id),
      rating: Number(row.rating) || 0,
      comment: String(row.comment ?? ""),
      createdAt: String(row.created_at),
      authorDisplayName:
        (author as { full_name?: string | null } | null)?.full_name?.trim() ||
        null,
    };
  });
}

export async function listLandlordReviewsForPropertyRooms(
  db: SupabaseClient,
  roomIds: string[],
): Promise<ReviewPublic[]> {
  if (roomIds.length === 0) return [];
  const { data, error } = await db
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at, room_id,
      users:author_id ( full_name )
    `,
    )
    .in("room_id", roomIds)
    .eq("target_type", "landlord")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[reviews] listLandlordReviewsForPropertyRooms", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const author = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: String(row.id),
      rating: Number(row.rating) || 0,
      comment: String(row.comment ?? ""),
      createdAt: String(row.created_at),
      authorDisplayName:
        (author as { full_name?: string | null } | null)?.full_name?.trim() ||
        null,
    };
  });
}

export async function listStudentReviewsForOwners(
  db: SupabaseClient,
  studentId: string,
): Promise<ReviewPublic[]> {
  const { data, error } = await db
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      users:author_id ( full_name )
    `,
    )
    .eq("target_id", studentId)
    .eq("target_type", "student")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[reviews] listStudentReviewsForOwners", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const author = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: String(row.id),
      rating: Number(row.rating) || 0,
      comment: String(row.comment ?? ""),
      createdAt: String(row.created_at),
      authorDisplayName:
        (author as { full_name?: string | null } | null)?.full_name?.trim() ||
        "Proprietario",
    };
  });
}

export function summarizeReviews(reviews: { rating: number }[]): {
  count: number;
  average: number | null;
  verified: boolean;
} {
  const count = reviews.length;
  if (count === 0) return { count: 0, average: null, verified: false };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((sum / count) * 10) / 10;
  return {
    count,
    average,
    verified: count >= VERIFIED_REVIEW_THRESHOLD,
  };
}

export async function insertReview(
  db: SupabaseClient,
  input: {
    tenancyId: string;
    authorId: string;
    targetType: ReviewTargetType;
    targetId: string;
    roomId: string;
    rating: number;
    comment: string;
  },
): Promise<{ error: string | null; id?: string }> {
  const { data, error } = await db
    .from("reviews")
    .insert({
      tenancy_id: input.tenancyId,
      author_id: input.authorId,
      target_type: input.targetType,
      target_id: input.targetId,
      room_id: input.roomId,
      rating: input.rating,
      comment: input.comment,
    })
    .select("id")
    .single();

  return { error: error?.message ?? null, id: data?.id ? String(data.id) : undefined };
}

export async function deleteReviewAsAuthor(
  db: SupabaseClient,
  reviewId: string,
  authorId: string,
): Promise<{ error: string | null }> {
  const { error } = await db
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("author_id", authorId);
  return { error: error?.message ?? null };
}

export async function insertReviewReport(
  db: SupabaseClient,
  input: { reviewId: string; reporterId: string; reason: string },
): Promise<{ error: string | null }> {
  const { error } = await db.from("review_reports").insert({
    review_id: input.reviewId,
    reporter_id: input.reporterId,
    reason: input.reason,
  });
  return { error: error?.message ?? null };
}

export type PendingReviewInvite = {
  tenancyId: string;
  roomId: string;
  roomLabel: string;
  propertyZone: string | null;
  city: string | null;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string | null;
  endedAt: string;
};

/** Ended tenancies where the current user still owes a review. */
export async function listPendingReviewsForUser(
  db: SupabaseClient,
  userId: string,
  role: "student" | "owner" | "admin",
): Promise<PendingReviewInvite[]> {
  const pending: PendingReviewInvite[] = [];

  if (role === "student" || role === "admin") {
    const { data: asStudent } = await db
      .from("room_tenancies")
      .select(
        `
        id, ended_at, room_id, student_id,
        rooms:room_id (
          id, room_label,
          properties:property_id ( id, zone, city, owner_id, users:owner_id ( full_name ) )
        )
      `,
      )
      .eq("student_id", userId)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .limit(20);

    for (const t of asStudent ?? []) {
      const room = Array.isArray(t.rooms) ? t.rooms[0] : t.rooms;
      const propertyRaw = room
        ? (room as { properties?: unknown }).properties
        : null;
      const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
      const ownerId = (property as { owner_id?: string } | null)?.owner_id;
      if (!ownerId || !room) continue;

      const { data: existing } = await db
        .from("reviews")
        .select("id")
        .eq("tenancy_id", t.id)
        .eq("author_id", userId)
        .eq("target_type", "landlord")
        .maybeSingle();
      if (existing) continue;

      const ownerUser = (property as { users?: unknown } | null)?.users;
      const owner = Array.isArray(ownerUser) ? ownerUser[0] : ownerUser;

      pending.push({
        tenancyId: String(t.id),
        roomId: String((room as { id: string }).id),
        roomLabel: String((room as { room_label?: string }).room_label ?? "Stanza"),
        propertyZone: (property as { zone?: string | null } | null)?.zone ?? null,
        city: (property as { city?: string | null } | null)?.city ?? null,
        targetType: "landlord",
        targetId: ownerId,
        targetName:
          (owner as { full_name?: string | null } | null)?.full_name?.trim() ||
          null,
        endedAt: String(t.ended_at),
      });
    }
  }

  if (role === "owner" || role === "admin") {
    const { data: ownedRooms } = await db
      .from("rooms")
      .select("id, room_label, properties:property_id!inner ( owner_id, zone, city )")
      .eq("properties.owner_id", userId);

    const roomIds = (ownedRooms ?? []).map((r) => String(r.id));
    if (roomIds.length > 0) {
      const { data: asOwner } = await db
        .from("room_tenancies")
        .select(
          `
          id, ended_at, room_id, student_id,
          users:student_id ( full_name ),
          rooms:room_id ( id, room_label, properties:property_id ( zone, city ) )
        `,
        )
        .in("room_id", roomIds)
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .limit(30);

      for (const t of asOwner ?? []) {
        const { data: existing } = await db
          .from("reviews")
          .select("id")
          .eq("tenancy_id", t.id)
          .eq("author_id", userId)
          .eq("target_type", "student")
          .maybeSingle();
        if (existing) continue;

        const room = Array.isArray(t.rooms) ? t.rooms[0] : t.rooms;
        const propertyRaw = room
          ? (room as { properties?: unknown }).properties
          : null;
        const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
        const student = Array.isArray(t.users) ? t.users[0] : t.users;

        pending.push({
          tenancyId: String(t.id),
          roomId: String(t.room_id),
          roomLabel: String(
            (room as { room_label?: string } | null)?.room_label ?? "Stanza",
          ),
          propertyZone: (property as { zone?: string | null } | null)?.zone ?? null,
          city: (property as { city?: string | null } | null)?.city ?? null,
          targetType: "student",
          targetId: String(t.student_id),
          targetName:
            (student as { full_name?: string | null } | null)?.full_name?.trim() ||
            null,
          endedAt: String(t.ended_at),
        });
      }
    }
  }

  return pending;
}
