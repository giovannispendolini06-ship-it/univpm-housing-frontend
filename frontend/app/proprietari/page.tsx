import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import OwnerInquiryForm from "./OwnerInquiryForm";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Proponi il tuo immobile | Coabito",
  description:
    "Affitta a Coabito con canone mensile garantito: firmiamo noi la locazione, gestiamo studenti e sublocazioni. Tu ricevi il canone concordato.",
  alternates: { canonical: `${SITE_URL}/proprietari` },
};

export default function OwnersPage() {
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppLink(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        "Ciao! Ho un immobile ad Ancona e vorrei saperne di più sul canone garantito di Coabito.",
      )
    : null;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal>
          <h1 className="mb-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Affitta il tuo immobile con canone garantito
          </h1>
          <p className="mb-6 max-w-xl text-base text-ink-muted">
            Coabito prende in locazione il tuo immobile, ti paga un canone fisso
            concordato ogni mese e gestisce studenti, contratti e incassi. Tu non
            devi occuparti delle trattative né dei periodi vuoti tra un inquilino e
            l&apos;altro.
          </p>
          <div className="mb-10 rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-3 text-sm text-ink">
            <p className="font-display text-sm font-bold text-sea-700">
              Canone garantito
            </p>
            <p className="mt-1 text-ink-muted">
              Dopo il sopralluogo concordiamo un canone mensile fisso: lo ricevi da
              Coabito secondo il contratto di locazione, indipendentemente da
              eventuali cambi di studente nelle stanze.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-2">
          <Reveal delay={100}>
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Come funziona
                </h2>
                <ol className="space-y-4 text-sm text-ink-muted">
                  <li>
                    <strong className="block text-ink">1. Ci racconti il tuo immobile</strong>
                    Compila il form qui a fianco: ti ricontattiamo entro 24-48 ore.
                  </li>
                  <li>
                    <strong className="block text-ink">
                      2. Definiamo insieme il canone garantito
                    </strong>
                    Sopralluogo e valutazione: concordiamo un canone fisso mensile
                    sostenibile per te e per il mercato studente.
                  </li>
                  <li>
                    <strong className="block text-ink">
                      3. Firmiamo un contratto di locazione con te
                    </strong>
                    Coabito diventa conduttore dell&apos;immobile. Tu ricevi il canone
                    concordato ogni mese, senza gestire le sublocazioni.
                  </li>
                  <li>
                    <strong className="block text-ink">
                      4. Coabito gestisce tutto il resto
                    </strong>
                    Selezione studenti, contratti di sublocazione, incasso e
                    comunicazioni: ci pensiamo noi.
                  </li>
                </ol>
              </div>

              <div className="rounded-xl2 bg-white p-4 text-xs text-ink-muted shadow-card">
                Preferisci scriverci direttamente?{" "}
                <a href="mailto:info@coabito.it" className="text-sea-700 underline">
                  info@coabito.it
                </a>
                {whatsappLink && (
                  <>
                    {" "}
                    o su{" "}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#25D366] underline"
                    >
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <OwnerInquiryForm />
          </Reveal>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
