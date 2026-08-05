"use client";

import Link from "next/link";
import HeroMockup from "./HeroMockup";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Anelli decorativi sottili: stesso motivo visivo del logo e del
          punteggio di compatibilità (MatchScoreRing), non una sfumatura
          sfocata generica. Solo tratti, nessun riempimento: composizione
          volutamente asimmetrica, non centrata. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[380px] w-[380px] text-sea-600/[0.07]"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-[220px] w-[220px] text-sunset-500/[0.1]"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="6 5" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-xs font-medium text-sea-700">
              {t.hero.badge}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
              {t.hero.titlePart1}
              <span className="text-sea-600">{t.hero.titleHighlight}</span>
              {t.hero.titlePart2}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-sea-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-sea-700 hover:shadow-lg"
              >
                {t.hero.ctaStudent}
              </Link>
              <a
                href="/proprietari"
                className="rounded-xl2 border border-sea-200 bg-white px-6 py-3 text-center text-sm font-semibold text-ink transition hover:border-sea-400"
              >
                {t.hero.ctaOwner}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-4 text-xs text-ink-muted">
              {t.hero.freeNote} ·{" "}
              <Link href="/esempi" className="text-sea-700 underline underline-offset-2">
                {t.hero.seeExample}
              </Link>
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="relative">
            <TiltCard>
              <HeroMockup />
            </TiltCard>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl2 bg-white px-4 py-3 shadow-card sm:-left-8 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sea-600" />
              <p className="text-[11px] font-medium text-ink-muted">
                {t.hero.liveCompatibility}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
