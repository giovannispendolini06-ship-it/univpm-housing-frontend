import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import OwnerInquiryForm from "./OwnerInquiryForm";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Proponi il tuo immobile | Coabito",
  description:
    "Affitta il tuo immobile a studenti verificati, senza gestire tu le trattative.",
};

export default function OwnersPage() {
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? buildWhatsAppLink(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        "Ciao! Ho un immobile ad Ancona e vorrei saperne di più su Coabito.",
      )
    : null;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal>
          <h1 className="mb-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Affitta il tuo immobile a studenti verificati
          </h1>
          <p className="mb-10 max-w-xl text-base text-ink-muted">
            Ci occupiamo noi della ricerca, della verifica e del primo contatto.
            Tu decidi solo con chi firmare.
          </p>
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
                    Compila il form qui a fianco, ti ricontattiamo entro 24-48 ore.
                  </li>
                  <li>
                    <strong className="block text-ink">2. Lo pubblichiamo</strong>
                    Sia sulla nostra piattaforma sia sui principali portali immobiliari.
                  </li>
                  <li>
                    <strong className="block text-ink">3. Filtriamo gli interessati</strong>
                    Solo studenti compatibili e verificati arrivano fino a te.
                  </li>
                  <li>
                    <strong className="block text-ink">4. Decidi tu</strong>
                    Chiudi l&apos;affitto quando sei pronto, ai tuoi tempi.
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
                    {" "}o su{" "}
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
