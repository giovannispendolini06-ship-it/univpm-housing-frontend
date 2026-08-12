"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Reveal from "@/components/landing/Reveal";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function FaqStudentiContent() {
  const { t } = useLocale();
  const f = t.faqStudenti;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

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
              {f.backHome}
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sea-600">
              {f.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {f.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              {f.subtitle}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-8 divide-y divide-sea-100 rounded-xl2 bg-surface shadow-card">
              {f.items.map((faq, index) => {
                const isOpen = openIndex === index;
                const panelId = `faq-panel-${index}`;
                const buttonId = `faq-button-${index}`;
                return (
                  <div key={faq.question}>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => toggle(index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="font-display text-sm font-bold text-ink sm:text-base">
                        {faq.question}
                      </span>
                      <span
                        className={`shrink-0 text-xl text-sea-600 transition-transform duration-200 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`grid overflow-hidden transition-all duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/lista-attesa"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-sea-600 px-5 text-sm font-semibold text-white hover:bg-sea-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
              >
                {f.ctaWaitlist}
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-sea-200 bg-white px-5 text-sm font-semibold text-sea-700 hover:bg-sea-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
              >
                {f.ctaChat}
              </Link>
            </div>
          </Reveal>
        </div>
      </article>

      <LandingFooter />
    </main>
  );
}
