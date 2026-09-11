import { redirect } from "next/navigation";
import Link from "next/link";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import OwnerInsight from "./OwnerInsight";
import VerificationPanel from "@/components/VerificationPanel";
import VerifiedBadge from "@/components/VerifiedBadge";
import GuaranteedRentWidget from "@/components/owner/GuaranteedRentWidget";
import OwnerPropertyCard, {
  type OwnerCandidate,
} from "@/components/owner/OwnerPropertyCard";
import OwnerPropertiesMap from "@/components/owner/OwnerPropertiesMap";
import type { VerificationStatus } from "@/lib/verification";
import {
  aggregateGuaranteedPayout,
  type GuaranteedPropertySummary,
} from "@/lib/owner/guaranteed-payout";
import { listApplicationsForOwnerRooms } from "@/lib/data/applications";
import {
  listStudentReviewsForOwners,
  summarizeReviews,
} from "@/lib/data/reviews";
import {
  computeEscrowAmountCents,
  type EscrowCoverage,
} from "@/lib/escrow";
import {
  syncOwnerPartnerTier,
  fetchOwnerMarketReport,
} from "@/lib/partner-tier-server";
import OwnerPartnerPanel from "@/components/owner/OwnerPartnerPanel";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  bozza: "In preparazione",
  attivo: "Pubblicato, in cerca di inquilini",
  affittato: "Affittato",
  sospeso: "Sospeso",
};

export default async function OwnerDashboardPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role, full_name, email, verification_status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  const db = createServiceSupabaseClient();
  const partnerSnapshot = await syncOwnerPartnerTier(db, user.id);
  const marketReport =
    partnerSnapshot.tier === "partner" || partnerSnapshot.tier === "fondatrice"
      ? await fetchOwnerMarketReport(db, user.id)
      : [];

  let propertyRows: Array<{
    id: string;
    address: string;
    zone: string | null;
    city?: string | null;
    status: string;
    monthly_rent_to_owner: number | null;
    guaranteed_rent: boolean | null;
    deposit_amount: number | null;
    escrow_coverage: string | null;
    latitude?: number | null;
    longitude?: number | null;
    rooms: Array<{
      id: string;
      room_label: string;
      is_available: boolean;
      price_monthly: number;
    }> | null;
  }> = [];

  {
    const rich = await db
      .from("properties")
      .select(
        "id, address, zone, city, status, monthly_rent_to_owner, guaranteed_rent, deposit_amount, escrow_coverage, latitude, longitude, rooms(id, room_label, is_available, price_monthly)",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (!rich.error && rich.data) {
      propertyRows = rich.data as typeof propertyRows;
    } else {
      const fallback = await db
        .from("properties")
        .select(
          "id, address, zone, city, status, monthly_rent_to_owner, guaranteed_rent, deposit_amount, escrow_coverage, rooms(id, room_label, is_available, price_monthly)",
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      propertyRows = (fallback.data ?? []) as typeof propertyRows;
    }
  }

  const roomIds = propertyRows.flatMap((p) =>
    (p.rooms ?? []).map((r: { id: string }) => r.id),
  );

  const occupiedRoomIds = new Set<string>();
  if (roomIds.length > 0) {
    const { data: tenancies } = await db
      .from("room_tenancies")
      .select("room_id")
      .in("room_id", roomIds)
      .is("ended_at", null);
    for (const t of tenancies ?? []) occupiedRoomIds.add(String(t.room_id));
    // Fallback: room marked unavailable counts as occupied for display
    for (const p of propertyRows) {
      for (const r of p.rooms ?? []) {
        if (!r.is_available) occupiedRoomIds.add(r.id);
      }
    }
  }

  const guaranteedSummaries: GuaranteedPropertySummary[] = propertyRows
    .filter((p) => p.guaranteed_rent === true)
    .map((p) => {
      const rooms = p.rooms ?? [];
      const occupied =
        rooms.length > 0 && rooms.some((r: { id: string }) => occupiedRoomIds.has(r.id));
      return {
        id: p.id,
        zoneLabel: p.zone?.trim() || p.address,
        monthlyAmount: Number(p.monthly_rent_to_owner) || 0,
        occupied,
      };
    });

  const { totalMonthly } = aggregateGuaranteedPayout(guaranteedSummaries);

  const marketplaceRoomIds = propertyRows
    .filter((p) => !p.guaranteed_rent)
    .flatMap((p) => (p.rooms ?? []).map((r: { id: string }) => r.id));

  const { data: apps } = await listApplicationsForOwnerRooms(db, marketplaceRoomIds);

  const studentRoomPairs: { studentId: string; roomId: string }[] = [];
  for (const app of apps ?? []) {
    const student = Array.isArray(app.users) ? app.users[0] : app.users;
    const sid = (student as { id?: string } | null)?.id;
    if (sid && app.room_id) {
      studentRoomPairs.push({ studentId: sid, roomId: String(app.room_id) });
    }
  }

  const scoreByKey = new Map<string, number>();
  if (studentRoomPairs.length > 0) {
    const studentIds = Array.from(new Set(studentRoomPairs.map((p) => p.studentId)));
    const scoreRoomIds = Array.from(new Set(studentRoomPairs.map((p) => p.roomId)));
    const { data: scores } = await db
      .from("match_scores")
      .select("student_id, room_id, compatibility_score")
      .in("student_id", studentIds)
      .in("room_id", scoreRoomIds);
    for (const s of scores ?? []) {
      scoreByKey.set(
        `${s.student_id}:${s.room_id}`,
        Number(s.compatibility_score) || 0,
      );
    }
  }

  const candidatesByProperty = new Map<string, OwnerCandidate[]>();
  const roomToProperty = new Map<string, string>();
  for (const p of propertyRows) {
    for (const r of p.rooms ?? []) {
      roomToProperty.set(r.id, p.id);
    }
  }

  for (const app of apps ?? []) {
    const propertyId = roomToProperty.get(String(app.room_id));
    if (!propertyId) continue;
    const room = Array.isArray(app.rooms) ? app.rooms[0] : app.rooms;
    const student = Array.isArray(app.users) ? app.users[0] : app.users;
    const studentId = (student as { id?: string } | null)?.id ?? "";
    const verification = (student as { verification_status?: string } | null)
      ?.verification_status;

    let reviewAverage: number | null = null;
    let reviewCount = 0;
    let reviewsVerified = false;
    let reviewSnippets: { id: string; rating: number; comment: string }[] = [];
    if (studentId) {
      try {
        const studentReviews = await listStudentReviewsForOwners(db, studentId);
        const summary = summarizeReviews(studentReviews);
        reviewAverage = summary.average;
        reviewCount = summary.count;
        reviewsVerified = summary.verified;
        reviewSnippets = studentReviews.slice(0, 2).map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
        }));
      } catch {
        /* table may not be migrated yet */
      }
    }

    const candidate: OwnerCandidate = {
      applicationId: String(app.id),
      roomLabel: (room as { room_label?: string } | null)?.room_label ?? "Stanza",
      status: String(app.status),
      message: app.message ? String(app.message) : null,
      studentId,
      studentName:
        (student as { full_name?: string } | null)?.full_name?.trim() || "Studente",
      studentVerified: verification === "verified",
      studentEmail: (student as { email?: string | null } | null)?.email ?? null,
      matchScore: studentId
        ? (scoreByKey.get(`${studentId}:${app.room_id}`) ?? null)
        : null,
      reviewAverage,
      reviewCount,
      reviewsVerified,
      reviewSnippets,
    };
    const list = candidatesByProperty.get(propertyId) ?? [];
    list.push(candidate);
    candidatesByProperty.set(propertyId, list);
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">
                {profile?.full_name
                  ? `Buongiorno, ${profile.full_name}`
                  : "Area proprietario"}
              </h1>
              <VerifiedBadge
                status={profile?.verification_status as VerificationStatus}
                role="owner"
              />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Vestiamo il tuo immobile su misura per l&apos;inquilino giusto —
              con canone garantito Coabito o sul marketplace indipendente.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <SignOutButton className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card" />
            <DeleteAccountButton isOwner />
          </div>
        </header>

        <div className="mb-6">
          <VerificationPanel
            role="owner"
            status={(profile?.verification_status as VerificationStatus) ?? "none"}
            email={profile?.email}
          />
        </div>

        <OwnerPartnerPanel
          snapshot={partnerSnapshot}
          marketReport={marketReport}
        />

        {guaranteedSummaries.length > 0 && (
          <GuaranteedRentWidget
            properties={guaranteedSummaries}
            totalMonthly={totalMonthly}
          />
        )}

        {propertyRows.length > 0 && <OwnerInsight />}

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/owner/properties/new"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Nuovo annuncio marketplace
          </Link>
          <Link
            href="/profilo"
            className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          >
            Profilo
          </Link>
          <Link
            href="/messages"
            className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          >
            Messaggi
          </Link>
          <Link
            href="/recensioni"
            className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          >
            Recensioni
          </Link>
        </div>

        {propertyRows.length > 0 && (
          <OwnerPropertiesMap
            properties={propertyRows.map((p) => ({
              id: p.id,
              address: p.address,
              zone: p.zone,
              city: p.city ?? null,
              status: p.status,
              statusLabel: STATUS_LABELS[p.status] ?? p.status,
              monthlyRentToOwner: Number(p.monthly_rent_to_owner) || 0,
              guaranteedRent: p.guaranteed_rent === true,
              latitude: typeof p.latitude === "number" ? p.latitude : null,
              longitude: typeof p.longitude === "number" ? p.longitude : null,
            }))}
          />
        )}

        {propertyRows.length === 0 ? (
          <div className="rounded-xl2 bg-surface p-6 text-center shadow-card">
            <p className="text-sm text-ink-muted">
              Non hai ancora nessun immobile collegato al tuo account.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Pubblica sul marketplace, oppure scrivici a{" "}
              <a href="mailto:info@coabito.it" className="text-sea-700 underline">
                info@coabito.it
              </a>{" "}
              per un accordo di canone garantito.
            </p>
            <Link
              href="/owner/properties/new"
              className="mt-4 inline-block rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Pubblica un immobile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">
              I miei annunci
            </h2>
            <p className="text-sm text-ink-muted">
              Stato, candidature ricevute e azioni rapide (pausa / riattiva).
            </p>
            {propertyRows.map((property) => {
              const rooms = property.rooms ?? [];
              const occupied =
                rooms.length > 0 &&
                rooms.some((r: { id: string }) => occupiedRoomIds.has(r.id));
              const firstRoomPrice = Number(rooms[0]?.price_monthly) || 0;
              const escrowPreview = computeEscrowAmountCents({
                coverage: property.escrow_coverage as EscrowCoverage | null,
                firstMonthEuros: firstRoomPrice,
                depositEuros: property.deposit_amount,
              });
              return (
                <OwnerPropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    address: property.address,
                    zone: property.zone,
                    status: property.status,
                    statusLabel: STATUS_LABELS[property.status] ?? property.status,
                    monthlyRentToOwner: Number(property.monthly_rent_to_owner) || 0,
                    guaranteedRent: property.guaranteed_rent === true,
                    escrowCoverage: escrowPreview.coverage,
                    illustrativeEscrowCents: escrowPreview.totalCents || null,
                    illustrativeFirstMonthCents: escrowPreview.firstMonthCents || null,
                    illustrativeDepositCents: escrowPreview.depositCents || null,
                  }}
                  rooms={rooms}
                  occupied={occupied}
                  candidates={candidatesByProperty.get(property.id) ?? []}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
