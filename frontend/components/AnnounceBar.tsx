"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import {
  dismissAnnounce,
  getAnnounceLaunchMonth,
  hasJoinedWaitlist,
  isAnnounceDismissed,
  setAnnounceOffset,
} from "@/lib/announce-bar";
import styles from "./AnnounceBar.module.css";

/** Stesse aree private del FAB WhatsApp (quando presente). */
const HIDDEN_PREFIXES = [
  "/admin",
  "/dashboard",
  "/owner",
  "/onboarding",
  "/login",
  "/reset-password",
  "/lista-attesa",
];

export default function AnnounceBar() {
  const pathname = usePathname() || "/";
  const { t, locale } = useLocale();
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [ready, setReady] = useState(false);

  const hiddenByRoute = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    // Evita flash: leggi storage solo dopo mount.
    if (hiddenByRoute || isAnnounceDismissed() || hasJoinedWaitlist()) {
      setVisible(false);
      setReady(true);
      setAnnounceOffset(0);
      return;
    }
    setVisible(true);
    setReady(true);
  }, [hiddenByRoute]);

  useEffect(() => {
    if (!visible || closing || !barRef.current) {
      if (!visible) setAnnounceOffset(0);
      return;
    }

    const el = barRef.current;
    const sync = () => setAnnounceOffset(el.getBoundingClientRect().height);

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [visible, closing]);

  useEffect(() => {
    return () => setAnnounceOffset(0);
  }, []);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    dismissAnnounce();
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setAnnounceOffset(0);
    }, 280);
  }

  if (!ready || !visible) return null;

  const month = getAnnounceLaunchMonth(locale);
  const message = t.announceBar.message.replace("{month}", month);

  return (
    <div
      ref={barRef}
      className={`${styles.bar} ${closing ? styles.closing : ""}`}
      role="region"
      aria-label={t.announceBar.ariaLabel}
    >
      <div className={styles.inner}>
        <span className={styles.dot} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
        <Link href="/lista-attesa" className={styles.cta}>
          {t.announceBar.cta}
        </Link>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={handleClose}
        aria-label={t.announceBar.closeAria}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
