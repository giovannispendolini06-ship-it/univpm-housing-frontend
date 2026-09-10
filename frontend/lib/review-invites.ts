import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";
import { buildReviewInviteEmail, sendEmail } from "@/lib/email";

type InviteResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * Finds ended tenancies that have not yet received a review invite email,
 * emails student + landlord, and stamps review_invite_sent_at.
 */
export async function processDueReviewInvites(
  db: SupabaseClient,
  opts?: { tenancyId?: string },
): Promise<InviteResult> {
  let query = db
    .from("room_tenancies")
    .select(
      `
      id, ended_at, student_id, room_id, review_invite_sent_at,
      users:student_id ( id, full_name, email ),
      rooms:room_id (
        id, room_label,
        properties:property_id (
          zone, city, owner_id,
          users:owner_id ( id, full_name, email )
        )
      )
    `,
    )
    .not("ended_at", "is", null)
    .is("review_invite_sent_at", null)
    .order("ended_at", { ascending: true })
    .limit(40);

  if (opts?.tenancyId) {
    query = query.eq("id", opts.tenancyId);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("[review-invites]", error.message);
    return { processed: 0, sent: 0, failed: 0, skipped: 0 };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const room = Array.isArray(row.rooms) ? row.rooms[0] : row.rooms;
    const propertyRaw = room
      ? (room as { properties?: unknown }).properties
      : null;
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
    const student = Array.isArray(row.users) ? row.users[0] : row.users;
    const ownerUser = (property as { users?: unknown } | null)?.users;
    const owner = Array.isArray(ownerUser) ? ownerUser[0] : ownerUser;

    const roomLabel =
      (room as { room_label?: string } | null)?.room_label ?? "Stanza";
    const zone =
      (property as { zone?: string | null } | null)?.zone ??
      (property as { city?: string | null } | null)?.city ??
      "";
    const reviewUrl = `${SITE_URL}/recensioni/${row.id}`;

    const studentEmail = (student as { email?: string | null } | null)?.email?.trim();
    const studentName =
      (student as { full_name?: string | null } | null)?.full_name?.trim() ||
      "Studente";
    const ownerEmail = (owner as { email?: string | null } | null)?.email?.trim();
    const ownerName =
      (owner as { full_name?: string | null } | null)?.full_name?.trim() ||
      "Proprietario";

    if (!studentEmail && !ownerEmail) {
      skipped += 1;
      continue;
    }

    let allOk = true;

    if (studentEmail) {
      const mail = buildReviewInviteEmail({
        fullName: studentName,
        role: "student",
        roomLabel,
        zoneLabel: zone,
        reviewUrl,
      });
      const ok = await sendEmail({
        to: studentEmail,
        subject: mail.subject,
        html: mail.html,
      });
      if (ok) sent += 1;
      else {
        failed += 1;
        allOk = false;
      }
    }

    if (ownerEmail) {
      const mail = buildReviewInviteEmail({
        fullName: ownerName,
        role: "owner",
        roomLabel,
        zoneLabel: zone,
        reviewUrl,
      });
      const ok = await sendEmail({
        to: ownerEmail,
        subject: mail.subject,
        html: mail.html,
      });
      if (ok) sent += 1;
      else {
        failed += 1;
        allOk = false;
      }
    }

    // Stamp even if one side failed, to avoid infinite retries flooding the other.
    // Only skip stamp when both failed and we want retry — prefer stamp after attempt.
    if (allOk || studentEmail || ownerEmail) {
      await db
        .from("room_tenancies")
        .update({ review_invite_sent_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }

  return {
    processed: (rows ?? []).length,
    sent,
    failed,
    skipped,
  };
}

/** Immediate invite after admin ends a tenancy. */
export async function sendReviewInvitesForTenancy(
  db: SupabaseClient,
  tenancyId: string,
): Promise<void> {
  try {
    await processDueReviewInvites(db, { tenancyId });
  } catch (err) {
    console.error(
      "[review-invites] sendReviewInvitesForTenancy",
      err instanceof Error ? err.message : err,
    );
  }
}
