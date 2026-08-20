import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listApplicationsForStudent } from "@/lib/data/applications";
import { getPublicListing } from "@/lib/listings";
import {
  computeProfileCompletion,
  type ProgressiveUserFields,
} from "@/lib/profile-completion";
import { computeChatProgressFromProfile } from "@/lib/chat-progress";
import StudentShell from "@/components/student/StudentShell";
import StudentHomeContent, {
  type HomeApplication,
} from "@/components/student/StudentHomeContent";
import type { Listing } from "@/lib/domain/types";
import type { MyTenancy } from "@/components/MyHomeCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La tua ricerca | Coabito",
};

type StoredReason = {
  label: string;
  detail: string;
  weight: "alto" | "medio" | "basso";
};

async function loadRecommended(
  studentId: string,
  limit = 3,
): Promise<{ listings: Listing[]; matchCount: number }> {
  const db = createServiceSupabaseClient();
  const { data: scores, count } = await db
    .from("match_scores")
    .select("room_id, compatibility_score, ai_reasoning", { count: "exact" })
    .eq("student_id", studentId)
    .order("compatibility_score", { ascending: false })
    .limit(limit);

  const matchCount = count ?? scores?.length ?? 0;
  if (!scores?.length) return { listings: [], matchCount: 0 };

  const listings: Listing[] = [];
  for (const row of scores) {
    const listing = await getPublicListing(String(row.room_id));
    if (!listing) continue;
    const reasoning = row.ai_reasoning as { reasons?: StoredReason[] } | null;
    const reasons = Array.isArray(reasoning?.reasons) ? reasoning!.reasons! : [];
    listings.push({
      ...listing,
      matchScore: Number(row.compatibility_score) || 0,
      matchReasons: reasons,
    });
  }

  return { listings, matchCount };
}

async function loadMyTenancy(
  studentId: string,
): Promise<MyTenancy | null> {
  const db = createServiceSupabaseClient();
  try {
    const { data: tenancy } = await db
      .from("room_tenancies")
      .select(
        `
        id, started_at, move_checklist,
        rooms:room_id (
          room_label, price_monthly, estimated_utilities,
          properties:property_id ( address, zone )
        )
      `,
      )
      .eq("student_id", studentId)
      .is("ended_at", null)
      .maybeSingle();

    if (!tenancy) return null;

    const now = new Date();
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { data: payment } = await db
      .from("rent_payments")
      .select("status")
      .eq("tenancy_id", tenancy.id)
      .eq("period_month", periodMonth)
      .maybeSingle();

    const room = Array.isArray((tenancy as { rooms?: unknown }).rooms)
      ? (tenancy as { rooms: unknown[] }).rooms[0]
      : (tenancy as { rooms?: unknown }).rooms;
    const propertyRaw =
      room && typeof room === "object"
        ? (room as { properties?: unknown }).properties
        : null;
    const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;

    return {
      startedAt: String((tenancy as { started_at?: string }).started_at ?? ""),
      roomLabel: String((room as { room_label?: string } | null)?.room_label ?? ""),
      priceMonthly: Number((room as { price_monthly?: number } | null)?.price_monthly ?? 0),
      estimatedUtilities: Number(
        (room as { estimated_utilities?: number } | null)?.estimated_utilities ?? 0,
      ),
      address: String((property as { address?: string } | null)?.address ?? ""),
      zone: (property as { zone?: string | null } | null)?.zone ?? null,
      paymentStatus:
        (payment?.status as MyTenancy["paymentStatus"] | undefined) ??
        "da_registrare",
      moveChecklist:
        ((tenancy as { move_checklist?: string[] | null }).move_checklist as
          | string[]
          | null) ?? null,
    };
  } catch {
    return null;
  }
}

function mapApplications(
  apps: Awaited<ReturnType<typeof listApplicationsForStudent>>["data"],
): HomeApplication[] {
  return (apps ?? []).slice(0, 4).map((app) => {
    const room = Array.isArray(app.rooms) ? app.rooms[0] : app.rooms;
    type PropShape = { zone?: string; city?: string };
    const property = room
      ? Array.isArray((room as { properties?: unknown }).properties)
        ? (room as { properties: PropShape[] }).properties[0]
        : (room as { properties?: PropShape }).properties
      : null;
    return {
      id: String(app.id),
      status: String(app.status),
      roomId: (room as { id?: string } | null)?.id ?? null,
      roomLabel: (room as { room_label?: string } | null)?.room_label ?? "Stanza",
      zone: property?.zone ?? "Zona",
      city: property?.city ?? "Ancona",
    };
  });
}

export default async function StudentDashboardPage() {
  const session = await requireRole(["student", "admin"]);
  const db = createServiceSupabaseClient();

  const [{ data: user }, { data: lifestyle }, appsRes, recommended, myTenancy] =
    await Promise.all([
      db
        .from("users")
        .select(
          "full_name, last_name, phone, avatar_url, date_of_birth, place_of_birth, sex, has_guarantor, verification_status",
        )
        .eq("id", session.id)
        .single(),
      db
        .from("student_profiles")
        .select(
          "campus_id, degree_course, budget_max, preferred_move_in_date, study_habit, sociability_level, guests_frequency, cleanliness_level, is_smoker, has_pets",
        )
        .eq("user_id", session.id)
        .maybeSingle(),
      listApplicationsForStudent(db, session.id),
      loadRecommended(session.id, 3),
      loadMyTenancy(session.id),
    ]);

  const completion = computeProfileCompletion(
    "student",
    user as ProgressiveUserFields | null,
  );
  const chatProgress = computeChatProgressFromProfile(
    lifestyle as Record<string, unknown> | null,
  );
  const hasVestaProfile = Boolean(
    lifestyle?.campus_id || lifestyle?.budget_max,
  );

  return (
    <StudentShell>
      <StudentHomeContent
        firstName={(user?.full_name ?? session.fullName ?? "").split(" ")[0] ?? ""}
        completion={completion}
        matchCount={recommended.matchCount}
        recommended={recommended.listings}
        applications={mapApplications(appsRes.data)}
        vestaProgressDone={chatProgress.done}
        vestaProgressTotal={chatProgress.total}
        hasVestaProfile={hasVestaProfile}
        studentId={session.id}
        myTenancy={myTenancy}
        isAdmin={session.role === "admin"}
      />
    </StudentShell>
  );
}
