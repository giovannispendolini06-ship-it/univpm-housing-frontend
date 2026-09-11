import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { isSeekerRole } from "@/lib/auth/roles";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import StudentShell from "@/components/student/StudentShell";
import OpenToMatchingToggle from "@/components/roommates/OpenToMatchingToggle";
import RoommateSuggestionCards from "@/components/roommates/RoommateSuggestionCards";
import {
  getOpenToGroupMatching,
  listRoommateSuggestions,
} from "@/lib/data/roommates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trova coinquilini | Coabito",
  robots: { index: false, follow: false },
};

type Search = Promise<{ city?: string; university?: string }>;

export default async function CoinquiliniPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await requireSession();
  if (!isSeekerRole(session.role)) {
    redirect(session.role === "owner" ? "/owner" : "/dashboard");
  }

  const sp = await searchParams;
  const citySlug = sp.city?.trim() || null;
  const universitySlug = sp.university?.trim() || null;

  const db = createServiceSupabaseClient();
  const optedIn = await getOpenToGroupMatching(db, session.id);
  const suggestions = optedIn
    ? await listRoommateSuggestions(db, session.id, {
        limit: 8,
        citySlug,
        universitySlug,
      })
    : [];

  const filterLabel = [citySlug, universitySlug].filter(Boolean).join(" · ");

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sea-700">
            Percorso alternativo
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">
            Trova coinquilini
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Prima le persone, poi la casa: profili compatibili con gli stessi
            pesi di Vesta. La ricerca classica per annuncio resta su{" "}
            <Link href="/stanze" className="font-semibold text-sea-700 underline">
              Stanze
            </Link>
            .
          </p>
          {filterLabel ? (
            <p className="mt-2 rounded-full bg-sea-50 px-3 py-1 text-xs font-semibold text-sea-700 inline-block">
              Filtro community: {filterLabel}{" "}
              <Link href="/coinquilini" className="ml-1 underline font-medium">
                togli
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">
              Suggerimento: apri un gruppo in{" "}
              <Link href="/community" className="font-semibold text-sea-700 underline">
                Community
              </Link>{" "}
              per filtrare per città/università.
            </p>
          )}
        </header>

        <OpenToMatchingToggle initialOpen={optedIn} />

        <section className="mt-6">
          <h2 className="mb-3 font-display text-sm font-bold text-ink">
            Profili compatibili
          </h2>
          {!optedIn ? (
            <div className="rounded-xl2 border border-dashed border-sea-200 bg-white px-4 py-8 text-center">
              <p className="text-sm text-ink-muted">
                Attiva il matching qui sopra per vedere i suggerimenti. Solo chi
                ha attivato il flag è proponibile.
              </p>
            </div>
          ) : (
            <RoommateSuggestionCards initial={suggestions} />
          )}
        </section>
      </div>
    </StudentShell>
  );
}
