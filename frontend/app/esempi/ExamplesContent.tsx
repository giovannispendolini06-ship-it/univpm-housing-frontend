"use client";

import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import ChatBubble from "@/components/ChatBubble";
import RoomCard from "@/components/RoomCard";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";

export default function ExamplesContent() {
  const { t } = useLocale();

  const exampleMessages: ChatMessage[] = t.esempi.exampleMessages.map((m, i) => ({
    id: String(i + 1),
    role: m.role,
    content: m.content,
    createdAt: "",
  }));

  const exampleRoom: RecommendedRoom = {
    id: "esempio",
    propertyId: "esempio",
    title: t.esempi.exampleRoom.title,
    zone: t.esempi.exampleRoom.zone,
    polo: "monte_dago",
    distanceMinutes: 9,
    distanceLabel: t.esempi.exampleRoom.distanceLabel,
    priceMonthly: 380,
    estimatedUtilities: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    matchScore: 92,
    matchReasons: [...t.esempi.exampleRoom.matchReasons],
    servicesIncluded: [...t.esempi.exampleRoom.servicesIncluded],
    availableFrom: t.esempi.exampleRoom.availableFrom,
  };

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          {t.common.backToHome}
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">
          {t.esempi.title}
        </h1>
        <p className="mb-10 text-sm text-ink-muted">{t.esempi.subtitle}</p>

        <section className="mb-14">
          <Reveal>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              {t.esempi.chatSectionTitle}
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              {t.esempi.chatSectionSubtitle}
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
              {t.esempi.matchSectionTitle}
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              {t.esempi.matchSectionSubtitle}
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
                {t.esempi.scoreGuideTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-muted">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sea-600" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreRangeHigh}</strong>{" "}
                    {t.esempi.scoreHigh}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sand-400" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreRangeMedium}</strong>{" "}
                    {t.esempi.scoreMedium}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink-muted/40" />
                  <span>
                    <strong className="text-ink">{t.esempi.scoreRangeLow}</strong>{" "}
                    {t.esempi.scoreLow}
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
              {t.esempi.cta}
            </Link>
          </div>
        </Reveal>
      </div>

      <LandingFooter />
    </main>
  );
}
