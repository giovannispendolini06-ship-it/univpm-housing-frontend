"use client";

import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function GuideContent() {
  const { t } = useLocale();
  const g = t.guidaAffittoAncona;

  return (
    <main className="bg-bg">
      <LandingNavbar />

      <article className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_800px_320px_at_20%_0%,rgba(15,110,106,0.14),transparent_70%),radial-gradient(ellipse_600px_280px_at_90%_10%,rgba(255,107,74,0.12),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <Reveal>
            <Link
              href="/"
              className="text-sm font-medium text-sea-700 underline-offset-2 hover:underline"
            >
              {g.backHome}
            </Link>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {g.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              {g.subtitle}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-8 text-sm leading-relaxed text-ink sm:text-base">{g.intro}</p>
          </Reveal>

          <div className="mt-10 space-y-10">
            {g.sections.map((section, index) => (
              <Reveal key={section.title} delay={100 + index * 40}>
                <section>
                  <h2 className="font-display text-xl font-bold text-ink">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
                    {section.body}
                  </p>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-14 border-t border-sea-100 pt-10">
              <h2 className="font-display text-xl font-bold text-ink">{g.ctaTitle}</h2>
              <p className="mt-2 text-sm text-ink-muted sm:text-base">{g.ctaBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
                >
                  {g.ctaChat}
                </Link>
                <Link
                  href="/lista-attesa"
                  className="inline-flex rounded-full border border-sea-200 bg-white px-5 py-2.5 text-sm font-semibold text-sea-700 transition hover:bg-sea-50"
                >
                  {g.ctaWaitlist}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <LandingFooter />
    </main>
  );
}
