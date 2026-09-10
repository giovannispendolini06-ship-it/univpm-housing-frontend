import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import StudentShell from "@/components/student/StudentShell";
import LeaveReviewForm from "@/components/reviews/LeaveReviewForm";
import DeleteOwnReviewButton from "@/components/reviews/DeleteOwnReviewButton";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { ReviewTargetType } from "@/lib/data/reviews";

export const dynamic = "force-dynamic";

type Params = Promise<{ tenancyId: string }>;

export const metadata: Metadata = {
  title: "Lascia una recensione | Coabito",
  robots: { index: false, follow: false },
};

export default async function RecensioneTenancyPage({
  params,
}: {
  params: Params;
}) {
  const { tenancyId } = await params;
  const session = await requireSession();
  const db = createServiceSupabaseClient();

  const { data: tenancy } = await db
    .from("room_tenancies")
    .select(
      `
      id, ended_at, student_id, room_id,
      users:student_id ( full_name ),
      rooms:room_id (
        id, room_label,
        properties:property_id (
          zone, city, owner_id,
          users:owner_id ( full_name )
        )
      )
    `,
    )
    .eq("id", tenancyId)
    .maybeSingle();

  if (!tenancy) notFound();

  if (!tenancy.ended_at) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-xl font-bold text-ink">
          Recensione non ancora disponibile
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Puoi recensire solo dopo la fine del soggiorno.
        </p>
        <Link href="/recensioni" className="mt-4 inline-block text-sm font-semibold text-sea-700 underline">
          Torna alle recensioni
        </Link>
      </main>
    );
  }

  const room = Array.isArray(tenancy.rooms) ? tenancy.rooms[0] : tenancy.rooms;
  const propertyRaw = room
    ? (room as { properties?: unknown }).properties
    : null;
  const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
  const ownerId = (property as { owner_id?: string } | null)?.owner_id ?? null;
  const studentId = String(tenancy.student_id);

  const isStudent = session.id === studentId;
  const isOwner = ownerId != null && session.id === ownerId;
  const isAdmin = session.role === "admin";

  if (!isStudent && !isOwner && !isAdmin) {
    redirect("/recensioni");
  }

  let targetType: ReviewTargetType | null = null;
  if (isStudent) targetType = "landlord";
  else if (isOwner || isAdmin) targetType = "student";

  if (!targetType) redirect("/recensioni");

  const { data: existing } = await db
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("tenancy_id", tenancyId)
    .eq("author_id", session.id)
    .eq("target_type", targetType)
    .maybeSingle();

  const ownerUser = (property as { users?: unknown } | null)?.users;
  const owner = Array.isArray(ownerUser) ? ownerUser[0] : ownerUser;
  const student = Array.isArray(tenancy.users) ? tenancy.users[0] : tenancy.users;

  const targetLabel =
    targetType === "landlord"
      ? (owner as { full_name?: string | null } | null)?.full_name?.trim() ||
        "proprietario / annuncio"
      : (student as { full_name?: string | null } | null)?.full_name?.trim() ||
        "inquilino";

  const roomLabel =
    (room as { room_label?: string } | null)?.room_label ?? "Stanza";
  const zone =
    [(property as { zone?: string | null } | null)?.zone, (property as { city?: string | null } | null)?.city]
      .filter(Boolean)
      .join(" · ");

  const body = (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        href="/recensioni"
        className="mb-4 inline-block text-sm text-ink-muted underline"
      >
        ← Tutte le recensioni
      </Link>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">{roomLabel}</h1>
        {zone && <p className="mt-1 text-sm text-ink-muted">{zone}</p>}
        <p className="mt-2 text-xs text-ink-muted">
          Soggiorno terminato il{" "}
          {new Date(String(tenancy.ended_at)).toLocaleDateString("it-IT")}
        </p>
      </header>

      {existing ? (
        <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-4 shadow-card">
          <p className="font-display font-bold text-sea-700">
            Hai già recensito ({existing.rating}★)
          </p>
          <p className="mt-2 text-sm text-ink">{existing.comment}</p>
          <p className="mt-2 text-[11px] text-ink-muted">
            Pubblicata il{" "}
            {new Date(String(existing.created_at)).toLocaleDateString("it-IT")}.
            Dopo 48 ore non è più modificabile né cancellabile.
          </p>
          <DeleteOwnReviewButton
            reviewId={String(existing.id)}
            createdAt={String(existing.created_at)}
          />
        </div>
      ) : (
        <LeaveReviewForm
          tenancyId={tenancyId}
          targetType={targetType}
          targetLabel={targetLabel}
        />
      )}
    </div>
  );

  if (session.role === "student") {
    return <StudentShell>{body}</StudentShell>;
  }

  return <main className="min-h-dvh bg-bg">{body}</main>;
}
