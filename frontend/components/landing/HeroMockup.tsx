"use client";

import { useRef } from "react";
import VestaAvatar from "@/components/VestaAvatar";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./Hero.module.css";

/**
 * Mockup 3D della chat con Vesta: prospettiva fissa + parallasse al mouse
 * solo su pointer fine (desktop). Su touch resta la card inclinata statica.
 */
export default function HeroMockup() {
  const { t } = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  function resetTransform() {
    const card = cardRef.current;
    if (!card) return;
    const narrow = window.matchMedia("(max-width: 1100px)").matches;
    card.style.transform = narrow
      ? "translateX(-50%) rotateY(-18deg) rotateX(7deg) rotateZ(1deg)"
      : "rotateY(-26deg) rotateX(9deg) rotateZ(2deg)";
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(hover: none)").matches) return;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const narrow = window.matchMedia("(max-width: 1100px)").matches;
    const base = narrow ? "translateX(-50%) " : "";
    card.style.transform = `${base}rotateY(${-26 + x * 10}deg) rotateX(${9 - y * 8}deg) rotateZ(2deg)`;
  }

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTransform}
    >
      <div className={styles.glow} aria-hidden="true" />

      <div ref={cardRef} className={styles.card3d}>
        <div className={styles.browser}>
          <div className={styles.browserBar} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.browserInner}>
            <div className={styles.chatRow}>
              <VestaAvatar size={32} />
              <span className={styles.chatName}>Vesta</span>
            </div>
            <div className={`${styles.msg} ${styles.msgBot}`}>{t.hero.mockBot}</div>
            <div className={`${styles.msg} ${styles.msgMe}`}>{t.hero.mockUser}</div>
            <div className={styles.resultCard}>
              <div>
                <div className={styles.resultTitle}>{t.hero.mockRoomTitle}</div>
                <div className={styles.resultSub}>{t.hero.mockRoomMeta}</div>
              </div>
              <div className={styles.resultPct}>92%</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.floatBadge} ${styles.fb1}`}>
        <div className={styles.fbIconCoral}>V</div>
        <div>
          <div className={styles.fbTitle}>{t.hero.badgeCompatTitle}</div>
          <div className={styles.fbSub}>{t.hero.badgeCompatSub}</div>
        </div>
      </div>

      <div className={`${styles.floatBadge} ${styles.fb2}`}>
        <div className={styles.fbIconTeal} aria-hidden="true">
          ✓
        </div>
        <div>
          <div className={styles.fbTitle}>{t.hero.badgeFeesTitle}</div>
          <div className={styles.fbSub}>{t.hero.badgeFeesSub}</div>
        </div>
      </div>
    </div>
  );
}
