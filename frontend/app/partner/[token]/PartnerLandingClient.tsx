"use client";

import Link from "next/link";

export default function PartnerLandingClient({
  coabitoLink,
  whatsappHref,
  onboardingHref,
}: {
  coabitoLink: string;
  whatsappHref: string | null;
  onboardingHref: string;
}) {
  return (
    <main className="min-h-dvh bg-bg">
      <section className="relative overflow-hidden bg-gradient-to-br from-sea-700 via-sea-600 to-sea-800 px-4 pb-16 pt-14 text-white sm:px-6">
        <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-sunset-500/25 blur-3xl" />
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm font-semibold text-white/80">Coabito</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Porta il tuo immobile su Coabito
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Abbiamo preparato un percorso dedicato per te: pubblica o rivendica
            il tuo alloggio e raggiungi studenti in cerca.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={onboardingHref}
              className="inline-flex min-h-11 items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sea-700"
            >
              Inserisci il tuo immobile
            </Link>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Parla con Coabito
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Vantaggi</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            <li>Visibilità su domanda studente</li>
            <li>Matching coinquilini</li>
            <li>Onboarding guidato in pochi step</li>
          </ul>
        </div>
        <div className="rounded-xl2 border border-sea-100 bg-surface p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-ink">
            Hai già un annuncio su Coabito?
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Durante l&apos;onboarding potrai rivendicare un immobile esistente
            dopo verifica.
          </p>
          <Link
            href={onboardingHref}
            className="mt-3 inline-flex rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Rivendica immobile
          </Link>
        </div>
        <p className="text-xs text-ink-muted">
          Marketplace:{" "}
          <a href={coabitoLink} className="text-sea-700 underline">
            {coabitoLink}
          </a>
        </p>
      </section>
    </main>
  );
}
