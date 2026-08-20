"use client";

import CoabitoLogo from "@/components/CoabitoLogo";
import { openCookiePreferences } from "@/components/CookieConsentBanner";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function LandingFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-sea-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <CoabitoLogo size={32} />
            <span className="font-display text-base font-bold text-ink">Coabito</span>
          </div>

          <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
            {t.footer.tagline}
          </p>

          <a
            href="mailto:info@coabito.it"
            className="text-sm font-medium text-sea-700 underline underline-offset-2"
          >
            info@coabito.it
          </a>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Coabito. {t.footer.rights}</span>
          <a href="/privacy" className="underline underline-offset-2">
            {t.footer.privacy}
          </a>
          <a href="/termini" className="underline underline-offset-2">
            {t.footer.terms}
          </a>
          <a href="/servizi" className="underline underline-offset-2">
            {t.footer.services}
          </a>
          <a
            href="/guida/affittare-casa-studenti-ancona"
            className="underline underline-offset-2"
          >
            {t.footer.guide}
          </a>
          <a
            href="/guida/prima-volta-fuori-sede"
            className="underline underline-offset-2"
          >
            {t.footer.guideFirstTime}
          </a>
          <button
            type="button"
            onClick={() => openCookiePreferences()}
            className="underline underline-offset-2"
          >
            {t.footer.cookies}
          </button>
        </p>
      </div>
    </footer>
  );
}
