import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import StanzeListWithCompare from "@/components/listings/StanzeListWithCompare";
import StudentShell from "@/components/student/StudentShell";
import { listPublicListings } from "@/lib/listings";
import { getOptionalSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/domain/types";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stanze disponibili | Coabito",
  description:
    "Sfoglia stanze verificate ad Ancona: prezzo, zona e disponibilità. Candidati e trova coinquilini compatibili con Coabito.",
  alternates: { canonical: `${SITE_URL}/stanze` },
};

type SearchParams = Promise<{
  max?: string;
  min?: string;
  zona?: string;
  verificati?: string;
  garantito?: string;
  bagno?: string;
  entro?: string;
  sort?: string;
}>;

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

export default async function StanzePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const maxPrice = params.max ? Number(params.max) : undefined;
  const minPrice = params.min ? Number(params.min) : undefined;
  const zone = params.zona?.trim() || undefined;
  const verifiedOnly = params.verificati === "1";
  const guaranteedOnly = params.garantito === "1";
  const privateBathroom = params.bagno === "1";
  const availableFromBefore = params.entro?.trim() || undefined;
  const sortRaw = params.sort?.trim();
  const sort =
    sortRaw === "price_desc" || sortRaw === "newest" || sortRaw === "price_asc"
      ? sortRaw
      : "price_asc";

  let listings: Listing[] = [];
  let loadError: string | null = null;
  const session = await getOptionalSession();
  const useStudentChrome = session?.role === "student";

  try {
    listings = await listPublicListings({
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      zone,
      verifiedOnly,
      guaranteedRentOnly: guaranteedOnly,
      privateBathroom,
      availableFromBefore,
      sort,
    });
    listings = await attachMatchScores(listings);
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Errore nel caricamento delle stanze.";
  }

  const pageBody = (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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

        <form
          className="mb-8 flex flex-wrap items-end gap-3 rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
          method="get"
        >
          <div>
            <label htmlFor="min" className="mb-1 block text-xs font-medium text-ink-muted">
              Min €
            </label>
            <input
              id="min"
              name="min"
              type="number"
              min={50}
              max={2000}
              defaultValue={params.min ?? ""}
              className="w-24 rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="200"
            />
          </div>
          <div>
            <label htmlFor="max" className="mb-1 block text-xs font-medium text-ink-muted">
              Max €
            </label>
            <input
              id="max"
              name="max"
              type="number"
              min={100}
              max={2000}
              defaultValue={params.max ?? ""}
              className="w-24 rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="420"
            />
          </div>
          <div>
            <label htmlFor="zona" className="mb-1 block text-xs font-medium text-ink-muted">
              Zona
            </label>
            <input
              id="zona"
              name="zona"
              type="text"
              defaultValue={params.zona ?? ""}
              className="w-36 rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="es. Torrette"
            />
          </div>
          <div>
            <label htmlFor="entro" className="mb-1 block text-xs font-medium text-ink-muted">
              Libera entro
            </label>
            <input
              id="entro"
              name="entro"
              type="date"
              defaultValue={params.entro ?? ""}
              className="rounded-xl border border-sea-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sort" className="mb-1 block text-xs font-medium text-ink-muted">
              Ordina
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="rounded-xl border border-sea-100 px-3 py-2 text-sm"
            >
              <option value="price_asc">Prezzo ↑</option>
              <option value="price_desc">Prezzo ↓</option>
              <option value="newest">Più recenti</option>
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="bagno"
              value="1"
              defaultChecked={privateBathroom}
              className="rounded border-sea-200"
            />
            Bagno privato
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="verificati"
              value="1"
              defaultChecked={verifiedOnly}
              className="rounded border-sea-200"
            />
            Solo verificati
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="garantito"
              value="1"
              defaultChecked={guaranteedOnly}
              className="rounded border-sea-200"
            />
            Solo canone garantito Coabito
          </label>
          <button
            type="submit"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
          >
            Filtra
          </button>
        </form>

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
              {zone
                ? "Le prime stanze in questa zona arrivano presto"
                : "Nessuna stanza pubblica al momento"}
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

        {listings.length > 0 && <StanzeListWithCompare listings={listings} />}
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
