import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import { SITE_URL } from "@/lib/site";
import ServiziCatalog from "./ServiziCatalog";

const PATH = "/servizi";

export const metadata: Metadata = {
  title: "Servizi | Coabito",
  description:
    "Catalogo servizi marketplace Coabito: verifica, matching, escrow, garanzie e supporto — contratto diretto tra studente e proprietario.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
};

export default function ServiziPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sea-700">
            Marketplace
          </p>
          <h1 className="mb-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Catalogo servizi
          </h1>
          <p className="mb-4 max-w-2xl text-base text-ink-muted">
            Coabito non è parte del contratto di locazione: proprietario e studente
            firmano direttamente. Il nostro ruolo è la tecnologia, il matching, la
            fiducia tra le parti e la sicurezza economica della transazione.
          </p>
          <p className="mb-10 rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-3 text-sm text-ink-muted">
            <strong className="text-ink">Disponibile</strong> = già in piattaforma o
            in attivazione.{" "}
            <strong className="text-ink">Roadmap</strong> = in priorità di prodotto,
            non ancora live.
          </p>
        </Reveal>

        <ServiziCatalog />
      </div>
      <LandingFooter />
    </main>
  );
}
