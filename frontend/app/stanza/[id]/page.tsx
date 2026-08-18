import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import ApplyButton from "@/components/listings/ApplyButton";
import ListingViewTracker from "@/components/listings/ListingViewTracker";
import { getPublicListing } from "@/lib/listings";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await getPublicListing(id);
    if (!listing) return { title: "Stanza | Coabito" };
    return {
      title: `${listing.title} · ${listing.cityLabel} | Coabito`,
      description: `Stanza a ${listing.neighbourhood ?? listing.cityLabel}: ${listing.monthlyRent}€/mese. Candidati su Coabito.`,
      alternates: { canonical: `${SITE_URL}/stanza/${id}` },
    };
  } catch {
    return { title: "Stanza | Coabito" };
  }
}

export default async function StanzaDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  let listing = null;
  try {
    listing = await getPublicListing(id);
  } catch {
    listing = null;
  }
  if (!listing) notFound();

  const total = listing.monthlyRent + listing.utilitiesEstimate;

  return (
    <main className="bg-bg">
      <LandingNavbar />
      <ListingViewTracker roomId={listing.id} title={listing.title} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/stanze" className="mb-6 inline-block text-sm text-ink-muted underline">
          ← Tutte le stanze
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-xl2 border border-sea-100 bg-white shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.photoUrls[0]}
                alt=""
                className="h-64 w-full object-cover sm:h-80"
              />
              {listing.photoUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-1 p-1">
                  {listing.photoUrls.slice(1, 5).map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="h-20 w-full object-cover" />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-ink">{listing.title}</h1>
                {listing.landlordVerified && (
                  <span className="rounded-full bg-sea-50 px-2.5 py-1 text-[11px] font-semibold text-sea-700">
                    Proprietario verificato
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-muted">
                {listing.neighbourhood ?? "Zona da confermare"} · {listing.cityLabel}
              </p>
              <p className="text-xs text-ink-muted">
                Indirizzo esatto condiviso solo dopo candidatura / contatto — privacy
                marketplace.
              </p>

              <dl className="grid gap-3 rounded-xl2 border border-sea-100 bg-white p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink-muted">Canone</dt>
                  <dd className="font-display font-bold text-ink">{listing.monthlyRent}€/mese</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Utenze stimate</dt>
                  <dd className="font-display font-bold text-ink">
                    ~{listing.utilitiesEstimate}€ · tot. {total}€
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Cauzione</dt>
                  <dd className="font-medium text-ink">
                    {listing.deposit != null ? `${listing.deposit}€` : "Da confermare"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Disponibile da</dt>
                  <dd className="font-medium text-ink">
                    {listing.availableFrom ?? "Da concordare"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Contratto</dt>
                  <dd className="font-medium text-ink">
                    {listing.contractType ?? "Da confermare"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Bagno</dt>
                  <dd className="font-medium text-ink">
                    {listing.privateBathroom ? "Privato" : "Condiviso / da confermare"}
                    {listing.furnished ? " · Arredato" : ""}
                  </dd>
                </div>
              </dl>

              {listing.amenities.length > 0 && (
                <div>
                  <h2 className="mb-2 font-display text-sm font-bold text-ink">Incluso</h2>
                  <ul className="flex flex-wrap gap-2">
                    {listing.amenities.map((a) => (
                      <li
                        key={a}
                        className="rounded-full bg-sea-50 px-3 py-1 text-xs font-medium text-sea-700"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl2 bg-sea-50 px-4 py-3 text-sm text-ink-muted">
                <p className="font-display text-sm font-bold text-ink">
                  Compatibilità Coabito
                </p>
                <p className="mt-1">
                  Il punteggio personalizzato (budget, polo, stile di vita) lo vedi dopo
                  l&apos;onboarding con Vesta nella tua dashboard — è un modello
                  deterministico trasparente, non una &quot;AI magica&quot;.
                </p>
                <Link href="/login" className="mt-2 inline-block font-semibold text-sea-700 underline">
                  Accedi per il tuo match
                </Link>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ApplyButton roomId={listing.id} roomTitle={listing.title} />
            <p className="text-[11px] leading-relaxed text-ink-muted">
              Coabito è un marketplace: facilita matching e fiducia. Il contratto di
              locazione resta tra studente e proprietario, salvo diversa struttura
              approvata legalmente.
            </p>
          </aside>
        </div>
      </div>
      <LandingFooter />
    </main>
  );
}
