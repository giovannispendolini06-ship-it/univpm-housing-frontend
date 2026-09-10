"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getOptionalSession, requireSession } from "@/lib/auth/session";
import {
  deleteReviewAsAuthor,
  insertReview,
  insertReviewReport,
  listPendingReviewsForUser,
  type ReviewTargetType,
} from "@/lib/data/reviews";
import {
  buildReviewReportAdminEmail,
  sendEmail,
} from "@/lib/email";

export type ReviewActionResult =
  | { ok: true; id?: string }
  | {
      ok: false;
      error: string;
      code:
        | "unauthenticated"
        | "forbidden"
        | "validation"
        | "duplicate"
        | "not_ended"
        | "error";
    };

function sanitizeComment(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

async function loadEndedTenancyContext(tenancyId: string) {
  const db = createServiceSupabaseClient();
  const { data, error } = await db
    .from("room_tenancies")
    .select(
      `
      id, ended_at, student_id, room_id,
      rooms:room_id (
        id,
        properties:property_id ( owner_id )
      )
    `,
    )
    .eq("id", tenancyId)
    .maybeSingle();

  if (error || !data) return null;
  const room = Array.isArray(data.rooms) ? data.rooms[0] : data.rooms;
  const propertyRaw = room
    ? (room as { properties?: unknown }).properties
    : null;
  const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
  const ownerId = (property as { owner_id?: string } | null)?.owner_id ?? null;

  return {
    tenancyId: String(data.id),
    endedAt: data.ended_at as string | null,
    studentId: String(data.student_id),
    roomId: String(data.room_id),
    ownerId,
  };
}

export async function submitReview(input: {
  tenancyId: string;
  targetType: ReviewTargetType;
  rating: number;
  comment: string;
}): Promise<ReviewActionResult> {
  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi per lasciare una recensione.",
      code: "unauthenticated",
    };
  }

  const tenancyId = input.tenancyId?.trim();
  if (!tenancyId) {
    return { ok: false, error: "Soggiorno non valido.", code: "validation" };
  }

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      ok: false,
      error: "Scegli un voto da 1 a 5 stelle.",
      code: "validation",
    };
  }

  const comment = sanitizeComment(input.comment ?? "");
  if (comment.length < 1 || comment.length > 500) {
    return {
      ok: false,
      error: "Il commento deve essere tra 1 e 500 caratteri.",
      code: "validation",
    };
  }

  if (input.targetType !== "landlord" && input.targetType !== "student") {
    return { ok: false, error: "Tipo recensione non valido.", code: "validation" };
  }

  const ctx = await loadEndedTenancyContext(tenancyId);
  if (!ctx || !ctx.ownerId) {
    return { ok: false, error: "Soggiorno non trovato.", code: "forbidden" };
  }
  if (!ctx.endedAt) {
    return {
      ok: false,
      error: "Puoi recensire solo a soggiorno terminato.",
      code: "not_ended",
    };
  }

  let targetId: string;
  if (input.targetType === "landlord") {
    if (session.id !== ctx.studentId) {
      return {
        ok: false,
        error: "Solo lo studente del soggiorno può recensire il proprietario.",
        code: "forbidden",
      };
    }
    targetId = ctx.ownerId;
  } else {
    if (session.id !== ctx.ownerId && session.role !== "admin") {
      return {
        ok: false,
        error: "Solo il proprietario può recensire lo studente.",
        code: "forbidden",
      };
    }
    targetId = ctx.studentId;
  }

  // Prefer authenticated client so RLS is enforced on INSERT.
  const auth = await createServerSupabaseClient();
  const { error, id } = await insertReview(auth, {
    tenancyId: ctx.tenancyId,
    authorId: session.id,
    targetType: input.targetType,
    targetId,
    roomId: ctx.roomId,
    rating,
    comment,
  });

  if (error) {
    if (/duplicate|unique/i.test(error)) {
      return {
        ok: false,
        error: "Hai già lasciato questa recensione.",
        code: "duplicate",
      };
    }
    // Fallback service role still keyed by session checks above
    const service = createServiceSupabaseClient();
    const retry = await insertReview(service, {
      tenancyId: ctx.tenancyId,
      authorId: session.id,
      targetType: input.targetType,
      targetId,
      roomId: ctx.roomId,
      rating,
      comment,
    });
    if (retry.error) {
      if (/duplicate|unique/i.test(retry.error)) {
        return {
          ok: false,
          error: "Hai già lasciato questa recensione.",
          code: "duplicate",
        };
      }
      console.error("[reviews] insert", retry.error);
      return {
        ok: false,
        error: "Non siamo riusciti a pubblicare la recensione.",
        code: "error",
      };
    }
    revalidatePath(`/stanza/${ctx.roomId}`);
    revalidatePath("/recensioni");
    revalidatePath(`/recensioni/${tenancyId}`);
    return { ok: true, id: retry.id };
  }

  revalidatePath(`/stanza/${ctx.roomId}`);
  revalidatePath("/recensioni");
  revalidatePath(`/recensioni/${tenancyId}`);
  return { ok: true, id };
}

export async function deleteOwnReview(
  reviewId: string,
): Promise<ReviewActionResult> {
  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi per cancellare la recensione.",
      code: "unauthenticated",
    };
  }

  const id = reviewId?.trim();
  if (!id) {
    return { ok: false, error: "Recensione non valida.", code: "validation" };
  }

  const service = createServiceSupabaseClient();
  const { data: row } = await service
    .from("reviews")
    .select("id, author_id, created_at, room_id")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.author_id !== session.id) {
    return {
      ok: false,
      error: "Non puoi cancellare questa recensione.",
      code: "forbidden",
    };
  }

  const created = new Date(String(row.created_at)).getTime();
  const hours = (Date.now() - created) / (1000 * 60 * 60);
  if (hours > 48) {
    return {
      ok: false,
      error: "Puoi cancellare una recensione solo entro 48 ore dalla pubblicazione.",
      code: "forbidden",
    };
  }

  const auth = await createServerSupabaseClient();
  const { error } = await deleteReviewAsAuthor(auth, id, session.id);
  if (error) {
    const retry = await deleteReviewAsAuthor(service, id, session.id);
    if (retry.error) {
      return {
        ok: false,
        error: "Non siamo riusciti a cancellare la recensione.",
        code: "error",
      };
    }
  }

  revalidatePath(`/stanza/${row.room_id}`);
  revalidatePath("/recensioni");
  return { ok: true };
}

export async function reportReview(input: {
  reviewId: string;
  reason: string;
}): Promise<ReviewActionResult> {
  const session = await getOptionalSession();
  if (!session) {
    return {
      ok: false,
      error: "Accedi per segnalare una recensione.",
      code: "unauthenticated",
    };
  }

  const reviewId = input.reviewId?.trim();
  const reason = sanitizeComment(input.reason ?? "");
  if (!reviewId || reason.length < 3) {
    return {
      ok: false,
      error: "Indica un motivo (almeno 3 caratteri).",
      code: "validation",
    };
  }

  const service = createServiceSupabaseClient();
  const { data: review } = await service
    .from("reviews")
    .select("id, rating, comment, target_type")
    .eq("id", reviewId)
    .maybeSingle();

  if (!review) {
    return { ok: false, error: "Recensione non trovata.", code: "forbidden" };
  }

  const auth = await createServerSupabaseClient();
  const { error } = await insertReviewReport(auth, {
    reviewId,
    reporterId: session.id,
    reason,
  });
  if (error) {
    const retry = await insertReviewReport(service, {
      reviewId,
      reporterId: session.id,
      reason,
    });
    if (retry.error) {
      return {
        ok: false,
        error: "Non siamo riusciti a inviare la segnalazione.",
        code: "error",
      };
    }
  }

  const mail = buildReviewReportAdminEmail({
    reviewId,
    reason,
    reporterEmail: session.email,
    rating: Number(review.rating) || 0,
    comment: String(review.comment ?? ""),
    targetType: String(review.target_type),
  });
  await sendEmail({
    to: "info@coabito.it",
    subject: mail.subject,
    html: mail.html,
  });

  return { ok: true };
}

export async function getPendingReviewsForCurrentUser() {
  const session = await requireSession();
  const role =
    session.role === "owner"
      ? "owner"
      : session.role === "admin"
        ? "admin"
        : "student";
  const db = createServiceSupabaseClient();
  return listPendingReviewsForUser(db, session.id, role);
}
