"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import AudienceToggle, { type Audience } from "./AudienceToggle";
import styles from "./FaqSection.module.css";

type FaqItem = {
  question: string;
  answer: string;
  worry?: boolean;
};

export default function FaqSection() {
  const { t } = useLocale();
  const [audience, setAudience] = useState<Audience>("student");
  const [openIndex, setOpenIndex] = useState(0);

  const items: readonly FaqItem[] =
    audience === "student" ? t.faq.studentItems : t.faq.ownerItems;

  function handleAudience(next: Audience) {
    setAudience(next);
    setOpenIndex(0);
  }

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }

  return (
    <section className="bg-bg" id="faq">
      <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-7 text-center">
          <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[1.3px] text-sunset-500">
            {t.faq.eyebrow}
          </p>
          <h2 className="mb-5 font-display text-[1.75rem] font-semibold text-ink sm:text-[28px]">
            {t.faq.title}
          </h2>
          <AudienceToggle value={audience} onChange={handleAudience} />
        </div>

        <div className="flex flex-col gap-2.5" key={audience}>
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `home-faq-panel-${audience}-${index}`;
            const buttonId = `home-faq-button-${audience}-${index}`;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,62,57,0.06)]"
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left sm:px-[22px]"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span
                    className={`text-[14.5px] font-bold leading-snug ${
                      faq.worry ? "text-sunset-500" : "text-ink"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm text-sea-600 ${styles.icon} ${
                      isOpen ? `${styles.iconOpen} bg-sea-50` : "bg-bg"
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
                  className={`${styles.panel} ${
                    isOpen ? styles.panelOpen : styles.panelClosed
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[13px] leading-relaxed text-ink-muted sm:px-[22px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/faq"
            className="font-medium text-sea-700 underline-offset-2 hover:underline"
          >
            {t.faq.seeAll}
          </Link>
        </p>
      </div>
    </section>
  );
}
