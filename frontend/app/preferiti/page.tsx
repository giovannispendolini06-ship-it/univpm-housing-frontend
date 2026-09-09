import Link from "next/link";
import { redirect } from "next/navigation";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import StudentShell from "@/components/student/StudentShell";
import PublicRoomCard from "@/components/listings/PublicRoomCard";
import { getOptionalSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listSavedRoomIds } from "@/lib/data/saved-listings";
import { getPublicListing } from "@/lib/listings";
import type { Listing } from "@/lib/domain/types";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "I tuoi preferiti | Coabito",
  description: "Stanze salvate sul marketplace Coabito.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/preferiti` },
};

export default async function PreferitiPage() {
  const session = await getOptionalSession();
  if (!session) {
    redirect("/login?next=/preferiti");
  }

  const db = createServiceSupabaseClient();
  const roomIds = await listSavedRoomIds(db, session.id);

  const listings: Listing[] = [];
  for (const id of roomIds) {
    try {
      const listing = await getPublicListing(id);
      if (listing) listings.push(listing);
    } catch {
      /* skip unavailable */
    }
  }

  const body = (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sea-700">
          La tua ricerca
        </p>
        <h1 className="font-display text-3xl font-bold text-ink">Preferiti</h1>
        <p className="mt-3 text-base text-ink-muted">
          Annunci che hai salvato. Puoi rimuoverli dal cuore sulla card o sul dettaglio.
        </p>
      </header>

      {listings.length === 0 ? (
        <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-10 text-center shadow-card">
          <p className="font-display text-lg font-bold text-ink">
            Nessun preferito ancora
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Sfoglia le stanze e tocca il cuore per salvarle qui.
          </p>
          <Link
            href="/stanze"
            className="mt-5 inline-flex rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
          >
            Vai alle stanze
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <PublicRoomCard
              key={listing.id}
              listing={listing}
              initialSaved
              isAuthenticated
            />
          ))}
        </div>
      )}
    </div>
  );

  if (session.role === "student") {
    return <StudentShell>{body}</StudentShell>;
  }

  return (
    <main className="bg-bg">
      <LandingNavbar />
      {body}
      <LandingFooter />
    </main>
  );
}
