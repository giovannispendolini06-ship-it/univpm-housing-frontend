"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function ShareListingButton({
  roomId,
  title,
  zoneLabel,
  priceMonthly,
}: {
  roomId: string;
  title: string;
  zoneLabel: string;
  priceMonthly: number;
}) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/stanza/${roomId}`
        : `/stanza/${roomId}`;
    const text =
      locale === "en"
        ? `${title} · ${zoneLabel} · €${priceMonthly}/mo on Coabito`
        : `${title} · ${zoneLabel} · ${priceMonthly}€/mese su Coabito`;

    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to clipboard */
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sea-200 bg-white text-sea-700 transition hover:bg-sea-50"
      aria-label={t.listingsCard.shareAria}
      title={copied ? t.listingsCard.shareCopied : t.listingsCard.share}
    >
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l5 5L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M8.2 13.2l7.5 4.3M15.7 6.5l-7.5 4.3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
