"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function FaqSection() {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-wide text-sea-600">
          {t.faq.eyebrow}
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {t.faq.title}
        </h2>

        <div className="mt-8 divide-y divide-sea-100 rounded-xl2 bg-surface shadow-card">
          {t.faq.items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
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
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
      </div>
    </section>
  );
}
