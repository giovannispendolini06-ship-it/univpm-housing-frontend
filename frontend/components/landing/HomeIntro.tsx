"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./HomeIntro.module.css";

const INTRO_KEY = "coabito_intro_seen";
const INTRO_MS = 5200;
const INTRO_MS_MOBILE = 4600;

/**
 * Overlay di apertura: la casa si disegna, poi l'icona Coabito appare
 * al suo interno. Solo prima visita di sessione; rispetta
 * prefers-reduced-motion. La homepage resta montata dietro.
 */
export default function HomeIntro() {
  const { t } = useLocale();
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    try {
      if (sessionStorage.getItem(INTRO_KEY)) return;
    } catch {
      return;
    }

    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  useEffect(() => {
    if (!active || exiting) return;

    function finish() {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* private mode / blocked storage */
      }
      setExiting(true);
      window.setTimeout(() => setActive(false), 420);
    }

    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const timer = window.setTimeout(finish, mobile ? INTRO_MS_MOBILE : INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [active, exiting]);

  function dismiss() {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* private mode / blocked storage */
    }
    setExiting(true);
    window.setTimeout(() => setActive(false), 420);
  }

  if (!active) return null;

  return (
    <>
      <div
        className={`${styles.overlay} ${exiting ? styles.overlayExiting : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.intro.ariaLabel}
      >
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.scene} aria-hidden="true">
          <div className={styles.houseGlow} />
          <div className={styles.house}>
            <svg viewBox="0 0 420 400" preserveAspectRatio="xMidYMid meet">
              <path className={styles.houseStroke} d="M 78 330 L 78 176 L 210 66 L 342 176 L 342 330" />
              <path className={styles.groundStroke} d="M 30 330 L 390 330" />
            </svg>
          </div>

          <div className={styles.mark}>
            <svg className={styles.markInner} viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#0F6E6A" />
              <path
                d="M16 6.5 Q16 3.5 19 4.5"
                stroke="#ffffff"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M13 8 L16 10.2 L19 8 L24.5 12 L21 15.2 L21 26 L11 26 L11 15.2 L7.5 12 Z"
                fill="#ffffff"
              />
              <circle cx="16" cy="18" r="1.3" fill="#FF6B4A" />
            </svg>
          </div>

          <div className={styles.word}>
            <div className={styles.brand}>Coabito</div>
            <div className={styles.tagline}>{t.intro.tagline}</div>
          </div>
        </div>
      </div>

      {!exiting && (
        <button type="button" className={styles.skip} onClick={dismiss}>
          {t.intro.skip}
        </button>
      )}
    </>
  );
}
