import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
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

export default async function CoinquiliniPage() {
  const session = await requireSession();
  if (session.role !== "student") {
    redirect(session.role === "owner" ? "/owner" : "/dashboard");
  }

  const db = createServiceSupabaseClient();
  const optedIn = await getOpenToGroupMatching(db, session.id);
  const suggestions = optedIn
    ? await listRoommateSuggestions(db, session.id, { limit: 8 })
    : [];

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
