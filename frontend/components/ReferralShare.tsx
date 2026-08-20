"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function ReferralShare({
  referralUrl,
}: {
  referralUrl: string;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.listaAttesa.referral.copyFallback, referralUrl);
    }
  }

  const waText = `${t.listaAttesa.referral.shareText} ${referralUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  return (
    <div className="mt-5 rounded-xl border border-sea-100 bg-white/80 p-4 text-left">
      <p className="font-display text-sm font-bold text-sea-700">
        {t.listaAttesa.referral.title}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{t.listaAttesa.referral.body}</p>
      <p className="mt-3 break-all rounded-lg bg-sea-50 px-3 py-2 font-mono text-xs text-ink">
        {referralUrl}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sea-600 px-4 text-sm font-semibold text-white hover:bg-sea-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
        >
          {copied ? t.listaAttesa.referral.copied : t.listaAttesa.referral.copy}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          aria-label={t.listaAttesa.referral.whatsappAria}
        >
          {t.listaAttesa.referral.whatsapp}
        </a>
      </div>
    </div>
  );
}
