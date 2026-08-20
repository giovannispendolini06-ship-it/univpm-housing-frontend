"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

/** Link "salta al contenuto" — visibile solo al focus da tastiera. */
export default function SkipToContent() {
  const { t } = useLocale();

  return (
    <a href="#main-content" className="skip-to-content">
      {t.a11y.skipToContent}
    </a>
  );
}
