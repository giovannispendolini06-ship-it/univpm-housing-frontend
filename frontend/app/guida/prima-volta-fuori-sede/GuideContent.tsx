"use client";

import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import FounderContactBox from "@/components/landing/FounderContactBox";
import { useLocale } from "@/lib/i18n/LocaleContext";

type GuideBlock = {
  heading?: string;
  body?: string;
  bullets?: readonly string[];
};

export default function GuideContent() {
  const { t } = useLocale();
  const g = t.guidaPrimaVolta;

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
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-8 text-sm leading-relaxed text-ink sm:text-base">{g.intro}</p>
          </Reveal>

          <div className="mt-10 space-y-12">
            {g.sections.map((section, index) => (
              <Reveal key={section.title} delay={100 + index * 40}>
                <section>
                  <h2 className="font-display text-xl font-bold text-ink">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-6">
                    {(section.blocks as unknown as GuideBlock[]).map((block, bi) => (
                      <div key={block.heading ?? `b-${bi}`}>
                        {block.heading ? (
                          <h3 className="font-display text-base font-bold text-ink">
                            {block.heading}
                          </h3>
                        ) : null}
                        {block.body ? (
                          <p
                            className={`text-sm leading-relaxed text-ink-muted sm:text-base ${
                              block.heading ? "mt-2" : ""
                            }`}
                          >
                            {block.body}
                          </p>
                        ) : null}
                        {block.bullets && block.bullets.length > 0 ? (
                          <ul
                            className={`list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted sm:text-base ${
                              block.heading || block.body ? "mt-2" : ""
                            }`}
                          >
                            {block.bullets.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-12 text-sm leading-relaxed text-ink sm:text-base">{g.closing}</p>
          </Reveal>

          <Reveal delay={140}>
            <FounderContactBox className="mt-10" />
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-10 text-sm text-ink-muted">
              <Link
                href="/guida/affittare-casa-studenti-ancona"
                className="font-medium text-sea-700 underline-offset-2 hover:underline"
              >
                {g.relatedGuide}
              </Link>
            </p>
          </Reveal>
        </div>
      </article>

      <LandingFooter />
    </main>
  );
}
