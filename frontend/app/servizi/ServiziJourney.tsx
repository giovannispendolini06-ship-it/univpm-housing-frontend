"use client";

import { useState } from "react";
import Link from "next/link";
import AudienceToggle, { type Audience } from "@/components/landing/AudienceToggle";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./ServiziJourney.module.css";

type ServiceRow = {
  title: string;
  body: string;
};

type Phase = {
  title: string;
  subtitle: string;
  items: readonly ServiceRow[];
};

function HouseIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 24 L24 10 L40 24"
        stroke="#0F6E6A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 21 V38 H35 V21"
        stroke="#0F6E6A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EuroIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="#0F6E6A" strokeWidth="3" />
      <path
        d="M24 15 v18 M19 19 a5 4 0 0 1 5 -2 c3 0 5 1.5 5 3.5 s-2 3.5 -5 3.5 c-3 0 -5 1.5 -5 3.5 s2 3.5 5 3.5 a5 4 0 0 0 5 -2"
        stroke="#FF6B4A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 12 h32 a3 3 0 0 1 3 3 v16 a3 3 0 0 1 -3 3 h-19 l-8 7 v-7 h-5 a3 3 0 0 1 -3 -3 v-16 a3 3 0 0 1 3 -3 z"
        stroke="#0F6E6A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PHASE_ICONS = [HouseIcon, EuroIcon, ChatIcon] as const;

export default function ServiziJourney() {
  const { t } = useLocale();
  const S = t.serviziJourney;
  const [audience, setAudience] = useState<Audience>("student");
  const [openIndex, setOpenIndex] = useState(0);

  const phases: readonly Phase[] =
    audience === "student" ? S.student.phases : S.owner.phases;

  function handleAudience(next: Audience) {
    setAudience(next);
    setOpenIndex(0);
  }

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[1.3px] text-sunset-500">
          {S.eyebrow}
        </p>
        <h1 className="mb-5 font-display text-[1.75rem] font-semibold leading-snug text-ink sm:text-[1.75rem]">
          {S.title}
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-ink-muted">
          {S.intro}
        </p>
        <AudienceToggle
          value={audience}
          onChange={handleAudience}
          labels={{ student: S.toggleStudent, owner: S.toggleOwner }}
        />
      </div>

      <div className={styles.panels} key={audience}>
        {phases.map((phase, index) => {
          const isOpen = openIndex === index;
          const Icon = PHASE_ICONS[index] ?? HouseIcon;
          const panelId = `servizi-panel-${audience}-${index}`;
          const buttonId = `servizi-button-${audience}-${index}`;

          return (
            <div key={phase.title} className={styles.panel}>
              <button
                id={buttonId}
                type="button"
                className={styles.head}
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className={styles.iconWrap}>
                  <Icon />
                </span>
                <span className={styles.titleBlock}>
                  <span className={styles.title}>{phase.title}</span>
                  <span className={styles.subtitle}>{phase.subtitle}</span>
                </span>
                <span
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`${styles.body} ${isOpen ? styles.bodyOpen : styles.bodyClosed}`}
              >
                <div className={styles.bodyInner}>
                  <div className={styles.bodyContent}>
                    {phase.items.map((item) => (
                      <div key={item.title} className={styles.row}>
                        <span className={styles.dot} aria-hidden="true" />
                        <div>
                          <p className={styles.rowTitle}>{item.title}</p>
                          <p className={styles.rowBody}>{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-[18px] border border-sea-100 bg-sea-50 px-5 py-5">
        <p className="mb-3 text-sm leading-relaxed text-ink-muted">{S.ctaBody}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/lista-attesa"
            className="rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sea-700"
          >
            {S.ctaStudent}
          </Link>
          <Link
            href="/proprietari"
            className="rounded-full border border-sea-200 bg-white px-4 py-2 text-sm font-semibold text-sea-700 transition hover:border-sea-400"
          >
            {S.ctaOwner}
          </Link>
        </div>
      </div>
    </div>
  );
}
