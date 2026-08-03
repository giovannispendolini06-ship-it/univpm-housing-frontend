import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import ChatBubble from "@/components/ChatBubble";
import RoomCard from "@/components/RoomCard";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";

export const metadata = {
  title: "Come funziona, con esempi | Bindo",
  description: "Un esempio vero di conversazione con Nomi e di come leggere il punteggio di compatibilità di una stanza.",
};

const exampleMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Ehi! 👋 Sono Nomi, ti aiuto a trovare casa. Che facoltà fai?",
    createdAt: "",
  },
  {
    id: "2",
    role: "user",
    content: "Ciao! Ingegneria Informatica, secondo anno",
    createdAt: "",
  },
  {
    id: "3",
    role: "assistant",
    content: "Top, quindi Monte Dago. Con la linea 65 (University Link) o la 46/ ci arrivi comodo. Budget mensile realistico?",
    createdAt: "",
  },
  {
    id: "4",
    role: "user",
    content: "Diciamo max 420, spese escluse",
    createdAt: "",
  },
  {
    id: "5",
    role: "assistant",
    content: "Perfetto, ho già trovato qualcosa di interessante qui a destra 👉 Dai un'occhiata alle stanze che ho selezionato per te.",
    createdAt: "",
  },
];

const exampleRoom: RecommendedRoom = {
  id: "esempio",
  propertyId: "esempio",
  title: "Singola luminosa con balcone",
  zone: "Baraccola",
  polo: "monte_dago",
  distanceMinutes: 9,
  distanceLabel: "9 min · Linea 46/",
  priceMonthly: 380,
  estimatedUtilities: 45,
  imageUrl:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
  matchScore: 92,
  matchReasons: [
    { label: "Budget compatibile", detail: "380€ rientra nei tuoi 420€ massimi", weight: "alto" },
    { label: "Orari di studio", detail: "Coinquilino attuale studia in silenzio la sera, come te", weight: "alto" },
    { label: "Vicinanza al polo", detail: "9 minuti da Monte Dago con la 46/", weight: "medio" },
  ],
  servicesIncluded: ["Wifi", "Lavatrice", "Riscaldamento centralizzato"],
  availableFrom: "1 ottobre",
};

export default function ExamplesPage() {
  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2">
          ← Torna alla home
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          Come funziona, in pratica
        </h1>
        <p className="mb-10 text-sm text-ink-muted">
          Due esempi concreti di quello che vedi usando la piattaforma. Nessun dato vero: solo per
          farti capire il tono e il tipo di risultato.
        </p>

        {/* --- Esempio 1: conversazione --- */}
        <section className="mb-14">
          <Reveal>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              Una conversazione con Nomi
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              Bastano due minuti di chat, in un tono normale — come scriveresti a un amico, non
              come compili un modulo.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-3 rounded-xl2 bg-white p-4 shadow-card sm:p-6">
              {exampleMessages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* --- Esempio 2: match score --- */}
        <section>
          <Reveal>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              Come leggiamo la compatibilità
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              Ogni stanza mostra un punteggio e il motivo dietro — non solo prezzo e metri quadri.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="max-w-sm">
              <RoomCard room={exampleRoom} />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-6 space-y-3 rounded-xl2 bg-white p-5 shadow-card">
              <h3 className="font-display text-sm font-bold text-ink">
                Come si legge il punteggio
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-muted">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sea-600" />
                  <span>
                    <strong className="text-ink">85-100%:</strong> compatibilità alta — budget,
                    orari e abitudini si allineano bene
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sand-400" />
                  <span>
                    <strong className="text-ink">65-84%:</strong> compatibilità media — vale la
                    pena dare un&apos;occhiata, con qualche compromesso
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink-muted/40" />
                  <span>
                    <strong className="text-ink">Sotto il 65%:</strong> resta un&apos;opzione
                    valida, solo meno allineata alle tue preferenze — mai un errore
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </section>

        <Reveal delay={100}>
          <div className="mt-14 text-center">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-sea-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sea-700 hover:shadow-lg"
            >
              Prova tu stesso →
            </Link>
          </div>
        </Reveal>
      </div>

      <LandingFooter />
    </main>
  );
}
