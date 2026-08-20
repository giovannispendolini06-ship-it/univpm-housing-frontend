import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import OwnerInquiryForm from "./OwnerInquiryForm";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Proponi il tuo immobile | Coabito",
  description:
    "Marketplace Coabito: studenti verificati e filtrati, tu firmi direttamente. Matching, fiducia e strumenti di sicurezza della transazione.",
};

export default function OwnersPage() {
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppLink(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        "Ciao! Ho un immobile ad Ancona e vorrei saperne di più sul marketplace Coabito.",
      )
    : null;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal>
          <h1 className="mb-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Affitta a studenti verificati, tu firmi direttamente
          </h1>
          <p className="mb-6 max-w-xl text-base text-ink-muted">
            Coabito è il marketplace: matching, verifica e fiducia tra le parti.
            Il contratto di locazione resta tra te e lo studente — noi non entriamo
            come controparte.
          </p>
          <div className="mb-10 rounded-xl2 border border-sea-100 bg-sea-50 px-4 py-3 text-sm text-ink">
            <p className="font-display text-sm font-bold text-sea-700">
              Fiducia senza diventare intermediari del contratto
            </p>
            <p className="mt-1 text-ink-muted">
              Pre-filtro degli studenti, badge di verifica e — in roadmap —
              escrow sulla prima mensilità/cauzione e garanzia opzionale contro
              inadempimento: sicurezza della transazione, contratto diretto tra le
              parti.
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
                    <strong className="block text-ink">2. Pubblichiamo l&apos;annuncio</strong>
                    Sulla piattaforma (e, dove ha senso, sui portali): foto e testo
                    chiari, pronti per gli studenti.
                  </li>
                  <li>
                    <strong className="block text-ink">
                      3. Ti mostriamo solo profili filtrati
                    </strong>
                    Studenti compatibili e, appena disponibili, verificati: meno
                    perditempo in selezione.
                  </li>
                  <li>
                    <strong className="block text-ink">
                      4. Decidi tu con chi firmare
                    </strong>
                    Chiudi il contratto direttamente con lo studente, ai tuoi tempi.
                    Coabito resta fuori dal contratto e può supportarti su matching,
                    mediazione e sicurezza della transazione.
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
