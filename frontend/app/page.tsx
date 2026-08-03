import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />
      <Hero />

      <HowItWorksSection
        id="studenti"
        eyebrow="Per gli studenti"
        title="Tre passaggi, e Domi fa il resto"
        variant="muted"
        ctaLabel="Inizia a chattare con Domi"
        ctaHref="/login"
        steps={[
          {
            number: "1",
            title: "Racconta chi sei",
            description:
              "Facoltà, polo UNIVPM, budget e data d'ingresso: bastano due minuti di chat, niente moduli infiniti.",
          },
          {
            number: "2",
            title: "Domi capisce le tue abitudini",
            description:
              "Orari di studio, vita sociale, pulizia: informazioni che di solito si scoprono solo dopo aver firmato.",
          },
          {
            number: "3",
            title: "Ricevi le stanze compatibili",
            description:
              "Ogni stanza mostra un punteggio di compatibilità e il perché, non solo prezzo e metri quadri.",
          },
        ]}
      />

      <HowItWorksSection
        id="proprietari"
        eyebrow="Per i proprietari"
        title="Affitta senza gestire tu le trattative"
        variant="default"
        ctaLabel="Proponi il tuo immobile"
        ctaHref="mailto:info@domoria.it?subject=Voglio%20affittare%20con%20Domi"
        steps={[
          {
            number: "1",
            title: "Ci mandi l'immobile",
            description:
              "Indirizzo, prezzo, foto: lo carichiamo noi sul tuo profilo e lo pubblichiamo anche sui portali principali.",
          },
          {
            number: "2",
            title: "Filtriamo noi gli interessati",
            description:
              "Solo studenti già verificati e compatibili con la tua casa arrivano fino a te: niente perditempo.",
          },
          {
            number: "3",
            title: "Tu decidi, noi gestiamo il resto",
            description:
              "Ti aggiorniamo su ogni richiesta seria. Chiudi l'affitto quando sei pronto, ai tuoi tempi.",
          },
        ]}
      />

      <LandingFooter />
    </main>
  );
}
