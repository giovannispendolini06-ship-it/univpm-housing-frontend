import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import PublicRoomCard from "@/components/listings/PublicRoomCard";
import { listPublicListings } from "@/lib/listings";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stanze disponibili | Coabito",
  description:
    "Sfoglia stanze verificate ad Ancona: prezzo, zona e disponibilità. Candidati e trova coinquilini compatibili con Coabito.",
  alternates: { canonical: `${SITE_URL}/stanze` },
};

type SearchParams = Promise<{ max?: string; zona?: string; verificati?: string }>;

export default async function StanzePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const maxPrice = params.max ? Number(params.max) : undefined;
  const zone = params.zona?.trim() || undefined;
  const verifiedOnly = params.verificati === "1";

  let listings: Awaited<ReturnType<typeof listPublicListings>> = [];
  let loadError: string | null = null;

  try {
    listings = await listPublicListings({
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      zone,
      verifiedOnly,
    });
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Errore nel caricamento delle stanze.";
  }

  return (
    <main className="bg-bg">
      <LandingNavbar />
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
            <label htmlFor="max" className="mb-1 block text-xs font-medium text-ink-muted">
              Budget max (€)
            </label>
            <input
              id="max"
              name="max"
              type="number"
              min={100}
              max={2000}
              defaultValue={params.max ?? ""}
              className="w-28 rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="es. 420"
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
              className="w-40 rounded-xl border border-sea-100 px-3 py-2 text-sm"
              placeholder="es. Torrette"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="verificati"
              value="1"
              defaultChecked={verifiedOnly}
              className="rounded border-sea-200"
            />
            Solo proprietari verificati
          </label>
          <button
            type="submit"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
          >
            Filtra
          </button>
        </form>

        {loadError && (
          <div className="rounded-xl2 border border-sunset-500/30 bg-white px-4 py-6 text-sm text-sunset-600" role="alert">
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
                href="/login"
                className="rounded-full border border-sea-200 px-4 py-2 text-sm font-semibold text-sea-700"
              >
                Accedi e chatta con Vesta
              </Link>
            </div>
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <PublicRoomCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
      <LandingFooter />
    </main>
  );
}
