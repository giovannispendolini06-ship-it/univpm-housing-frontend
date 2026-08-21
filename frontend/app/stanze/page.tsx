import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import StanzeBrowse from "@/components/listings/StanzeBrowse";
import StudentShell from "@/components/student/StudentShell";
import { listPublicListings } from "@/lib/listings";
import { getOptionalSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/domain/types";
import { SITE_URL } from "@/lib/site";
import { DEMO_STANZE_LISTINGS } from "@/lib/demo-stanze-listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stanze disponibili | Coabito",
  description:
    "Sfoglia stanze verificate ad Ancona: prezzo, zona e disponibilità. Candidati e trova coinquilini compatibili con Coabito.",
  alternates: { canonical: `${SITE_URL}/stanze` },
};

type StoredReason = {
  label: string;
  detail: string;
  weight: "alto" | "medio" | "basso";
};

async function attachMatchScores(listings: Listing[]): Promise<Listing[]> {
  if (listings.length === 0) return listings;

  const session = await getOptionalSession();
  if (!session || session.role !== "student") return listings;

  const db = createServiceSupabaseClient();
  const roomIds = listings.map((l) => l.id);
  const { data: scores } = await db
    .from("match_scores")
    .select("room_id, compatibility_score, ai_reasoning")
    .eq("student_id", session.id)
    .in("room_id", roomIds);

  if (!scores?.length) return listings;

  const byRoom = new Map(
    scores.map((s) => {
      const reasoning = s.ai_reasoning as { reasons?: StoredReason[] } | null;
      const reasons = Array.isArray(reasoning?.reasons) ? reasoning!.reasons! : [];
      return [
        String(s.room_id),
        {
          score: Number(s.compatibility_score) || 0,
          reasons,
        },
      ] as const;
    }),
  );

  return listings.map((listing) => {
    const match = byRoom.get(listing.id);
    if (!match) return listing;
    return {
      ...listing,
      matchScore: match.score,
      matchReasons: match.reasons,
    };
  });
}

export default async function StanzePage() {
  let listings: Listing[] = [];
  let loadError: string | null = null;
  let useStudentChrome = false;

  try {
    const session = await getOptionalSession();
    useStudentChrome = session?.role === "student";
    // Filtri ricchi applicati client-side (vedi StanzeBrowse); qui carichiamo
    // l'elenco pubblico completo per matching/score e sort consigliati.
    listings = await listPublicListings({ sort: "price_asc" });
    listings = await attachMatchScores(listings);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      // Consente di testare UI filtri in locale senza Supabase configurato.
      listings = DEMO_STANZE_LISTINGS;
      loadError = null;
      console.warn(
        "[stanze] Using demo listings (Supabase unavailable):",
        err instanceof Error ? err.message : err,
      );
    } else {
      loadError =
        err instanceof Error ? err.message : "Errore nel caricamento delle stanze.";
    }
  }

  const pageBody = (
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sea-700">
            Trova casa
          </p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Stanze disponibili
          </h1>
          <p className="mt-3 text-base text-ink-muted">
            Marketplace Coabito: annunci reali quando disponibili. L&apos;indirizzo
            esatto non è pubblico. Per un matching personalizzato chatta con Vesta
            dopo l&apos;accesso.
          </p>
        </header>

        {loadError && (
          <div
            className="rounded-xl2 border border-sunset-500/30 bg-white px-4 py-6 text-sm text-sunset-600"
            role="alert"
          >
            {loadError}
          </div>
        )}

        {!loadError && listings.length === 0 && (
          <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-10 text-center shadow-card">
            <p className="font-display text-lg font-bold text-ink">
              Nessuna stanza pubblica al momento
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              Stiamo onboarding i primi proprietari. Entra in lista d&apos;attesa o
              chatta con Vesta: ti avvisiamo appena arriva qualcosa di compatibile.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/lista-attesa"
                className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Lista d&apos;attesa
              </Link>
              <Link
                href="/login?next=/dashboard"
                className="rounded-full border border-sea-200 px-4 py-2 text-sm font-semibold text-sea-700"
              >
                Accedi e chatta con Vesta
              </Link>
            </div>
          </div>
        )}

        {listings.length > 0 && <StanzeBrowse listings={listings} />}
      </div>
  );

  if (useStudentChrome) {
    return <StudentShell>{pageBody}</StudentShell>;
  }

  return (
    <main className="bg-bg">
      <LandingNavbar />
      {pageBody}
      <LandingFooter />
    </main>
  );
}
