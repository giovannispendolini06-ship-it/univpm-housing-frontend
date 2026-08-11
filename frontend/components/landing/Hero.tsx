"use client";

import Link from "next/link";
import HeroMockup from "./HeroMockup";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./Hero.module.css";

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className={styles.hero}>
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            {t.hero.badge}
          </div>

          <h1 className={styles.headline}>
            {t.hero.titlePart1}
            <span className={styles.accent}>{t.hero.titleHighlight}</span>
            {t.hero.titlePart2}
          </h1>

          <p className={styles.subtext}>{t.hero.subtitle}</p>

          <div className={styles.ctaRow}>
            <Link href="/login" className={styles.btnPrimary}>
              {t.hero.ctaStudent}
            </Link>
            <a href="/proprietari" className={styles.btnSecondary}>
              {t.hero.ctaOwner}
            </a>
          </div>

          <p className={styles.microcopy}>
            {t.hero.freeNote}
            {" · "}
            <Link href="/esempi">{t.hero.seeExample}</Link>
          </p>
        </div>

        <HeroMockup />
      </div>

      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </section>
  );
}
