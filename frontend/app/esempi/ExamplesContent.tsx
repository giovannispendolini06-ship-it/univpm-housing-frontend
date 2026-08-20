"use client";

import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import ChatBubble from "@/components/ChatBubble";
import RoomCard from "@/components/RoomCard";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Locale } from "@/lib/i18n/translations";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";

const EXAMPLE_MESSAGES: Record<
  Locale,
  { role: ChatMessage["role"]; content: string }[]
> = {
  it: [
    {
      role: "assistant",
      content: "Ehi! 👋 Sono Vesta, ti aiuto a trovare casa. <QUESTION>Che facoltà fai?</QUESTION>",
    },
    {
      role: "user",
      content: "Ciao! Ingegneria Informatica, secondo anno",
    },
    {
      role: "assistant",
      content:
        "Top, quindi Monte Dago. Con la linea 65 (University Link) o la 46/ ci arrivi comodo. Budget mensile realistico?",
    },
    {
      role: "user",
      content: "Diciamo max 420, spese escluse",
    },
    {
      role: "assistant",
      content:
        "Perfetto, ho già trovato qualcosa di interessante qui a destra 👉 Dai un'occhiata alle stanze che ho selezionato per te.",
    },
  ],
  en: [
    {
      role: "assistant",
      content: "Hey! 👋 I'm Vesta, I'll help you find a place. What degree are you studying?",
    },
    {
      role: "user",
      content: "Hi! Computer Engineering, second year",
    },
    {
      role: "assistant",
      content:
        "Great, so Monte Dago. Line 65 (University Link) or the 46/ bus gets you there easily. What's a realistic monthly budget?",
    },
    {
      role: "user",
      content: "Let's say max 420, utilities excluded",
    },
    {
      role: "assistant",
      content:
        "Perfect, I've already found something interesting on the right 👉 Take a look at the rooms I've picked for you.",
    },
  ],
};

const EXAMPLE_ROOM: Record<Locale, RecommendedRoom> = {
  it: {
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
  },
  en: {
    id: "esempio",
    propertyId: "esempio",
    title: "Bright single room with balcony",
    zone: "Baraccola",
    polo: "monte_dago",
    distanceMinutes: 9,
    distanceLabel: "9 min · Line 46/",
    priceMonthly: 380,
    estimatedUtilities: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    matchScore: 92,
    matchReasons: [
      { label: "Budget match", detail: "€380 fits within your €420 max", weight: "alto" },
      { label: "Study hours", detail: "Current roommate studies in silence in the evening, like you", weight: "alto" },
      { label: "Distance from campus", detail: "9 minutes from Monte Dago on the 46/ bus", weight: "medio" },
    ],
    servicesIncluded: ["Wifi", "Washing machine", "Central heating"],
    availableFrom: "1 October",
  },
};

export default function ExamplesContent() {
  const { locale, t } = useLocale();

  const exampleMessages: ChatMessage[] = EXAMPLE_MESSAGES[locale].map((m, i) => ({
    id: String(i + 1),
    role: m.role,
    content: m.content,
    createdAt: "",
  }));

  const exampleRoom = EXAMPLE_ROOM[locale];

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          {t.esempi.backToHome}
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          {t.esempi.title}
        </h1>
        <p className="mb-10 text-sm text-ink-muted">{t.esempi.subtitle}</p>

        <section className="mb-14">
          <Reveal>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              {t.esempi.conversationTitle}
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              {t.esempi.conversationSubtitle}
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

        <section>
          <Reveal>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              {t.esempi.scoreTitle}
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              {t.esempi.scoreSubtitle}
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
                {t.esempi.howToReadTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-muted">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sea-600" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreHigh}</strong>{" "}
                    {t.esempi.scoreHighDetail}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sand-400" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreMed}</strong>{" "}
                    {t.esempi.scoreMedDetail}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink-muted/40" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreLow}</strong>{" "}
                    {t.esempi.scoreLowDetail}
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
              {t.esempi.tryItYourself}
            </Link>
          </div>
        </Reveal>
      </div>

      <LandingFooter />
    </main>
  );
}
