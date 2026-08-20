import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Porta il tuo immobile su Coabito",
  description:
    "Marketplace per affitti studenti: pubblica il tuo alloggio e trova coinquilini compatibili.",
};

export default function PartnerLandingPage() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const wa = waNumber
    ? buildWhatsAppLink(
        waNumber,
        "Ciao! Vorrei sapere come pubblicare un immobile su Coabito.",
      )
    : null;

  return (
    <main className="min-h-dvh bg-bg">
      <section className="relative overflow-hidden bg-gradient-to-br from-sea-700 via-sea-600 to-sea-800 px-4 pb-16 pt-14 text-white sm:px-6">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-sunset-500/20 blur-3xl" />
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm font-semibold tracking-wide text-white/80">
            Coabito
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Porta il tuo immobile su Coabito
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/85">
            Trova casa. Trova il coinquilino giusto. Pubblica gratuitamente e
            raggiungi studenti che cercano davvero.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/proprietari"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sea-700"
            >
              Inserisci il tuo immobile
            </Link>
            {wa && (
              <a
                href={wa}
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

      <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Cos&apos;è Coabito</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Coabito è il marketplace abitativo per studenti e giovani: matching
            tra alloggi e coinquilini compatibili, ricerca organizzata, meno
            caos tra annunci sparsi.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Perché pubblicare</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            <li>Visibilità su domanda studente attiva</li>
            <li>Inserimento semplice e gratuito</li>
            <li>Canale aggiuntivo rispetto ai portali classici</li>
            <li>Contatti più qualificati</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Come funziona</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
            <li>Ci lasci i tuoi dati o usi il link personalizzato</li>
            <li>Inserisci o rivendichi l&apos;immobile</li>
            <li>Pubblichi sul marketplace</li>
            <li>Ricevi richieste da studenti interessati</li>
          </ol>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">FAQ</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-ink">È a pagamento?</p>
              <p className="text-ink-muted">
                L&apos;inserimento base è pensato per essere semplice e accessibile.
                Scrivici per i dettagli sulla collaborazione.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Sono un&apos;agenzia: posso collaborare?</p>
              <p className="text-ink-muted">
                Sì. Coabito può essere un canale dedicato agli studenti per i
                vostri immobili.{" "}
                <Link href={SITE_URL} className="text-sea-700 underline">
                  Scopri di più
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
