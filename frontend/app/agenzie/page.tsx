import type { Metadata } from "next";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Agenzie immobiliari | Coabito",
  description:
    "Portate il catalogo su Coabito: traffico qualificato di studenti e lavoratori, success fee solo a risultato, programma Partner a livelli.",
};

const TIERS = [
  {
    name: "Standard",
    requirement: "Nessun requisito — ingresso immediato",
    perks: [
      "Pubblicazione annunci sul marketplace",
      "Candidature da profili verificati",
      "Success fee solo a contratto chiuso",
    ],
  },
  {
    name: "Partner Coabito",
    requirement: "Almeno 3 contratti chiusi negli ultimi 12 mesi",
    perks: [
      "Badge «Partner Coabito» su tutti gli annunci",
      "Priorità di visibilità nei risultati di ricerca",
      "Report di mercato in dashboard",
    ],
  },
  {
    name: "Agenzia Fondatrice",
    requirement: "Assegnato manualmente alle prime agenzie di Ancona",
    perks: [
      "Badge «Agenzia Fondatrice»",
      "Stessi vantaggi Partner",
      "Success fee ridotta permanente (founding_rate)",
    ],
  },
] as const;

export default function AgenciesPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />

      <section className="relative overflow-hidden border-b border-sea-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 10% 0%, #CFE6E4 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, #FFE4DC 0%, transparent 50%), linear-gradient(180deg, #F4F8F7 0%, #FFFFFF 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sunset-600">
            Per agenzie immobiliari
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Coabito
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            Traffico qualificato di studenti e lavoratori. Success fee solo a
            risultato. Un programma partner che riconosce chi pubblica il catalogo
            completo — non solo chi prova un annuncio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-sunset-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sunset-600"
            >
              Registra l&apos;agenzia
            </Link>
            <Link
              href="/proprietari"
              className="rounded-full border border-sea-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Sei un privato?
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          Perché le agenzie scelgono Coabito
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Siamo intermediari di matching e fiducia: il contratto resta tra agenzia
          e inquilino. Nessun canone trattenuto da Coabito.
        </p>
        <ul className="mt-8 space-y-6">
          <li>
            <h3 className="font-display text-base font-bold text-ink">
              Domanda già filtrata
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Profili con preferenze, budget e compatibilità Vesta — meno visite a
              vuoto, più candidature serie.
            </p>
          </li>
          <li>
            <h3 className="font-display text-base font-bold text-ink">
              Success fee a risultato
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Pagate solo quando un contratto si chiude su Coabito. Le Fondatrici
              hanno una tariffa ridotta permanente.
            </p>
          </li>
          <li>
            <h3 className="font-display text-base font-bold text-ink">
              Statistiche di zona
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Partner e Fondatrici accedono a un report semplice: prezzi medi e
              tempi di occupazione sulle zone del vostro catalogo.
            </p>
          </li>
        </ul>
      </section>

      <section className="border-y border-sea-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            Programma partner a livelli
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Tre livelli. Il passaggio a Partner è automatico; Fondatrice è
            riservata alle prime agenzie che aderiscono ad Ancona.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className="rounded-xl2 border border-sea-100 bg-bg p-4"
              >
                <h3 className="font-display text-base font-bold text-ink">
                  {tier.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-sunset-600">
                  {tier.requirement}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
                  {tier.perks.map((p) => (
                    <li key={p}>· {p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          Portate tutto il catalogo su Coabito
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-muted">
          Più annunci online, più matching, più contratti chiusi — e un percorso
          chiaro verso Partner e Fondatrice.
        </p>
        <Link
          href="/login?mode=signup"
          className="mt-6 inline-block rounded-full bg-sunset-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sunset-600"
        >
          Crea account agenzia
        </Link>
      </section>

      <LandingFooter />
    </main>
  );
}
