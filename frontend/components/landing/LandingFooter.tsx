"use client";

import Link from "next/link";
import CoabitoLogo from "@/components/CoabitoLogo";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { openCookiePreferences } from "@/components/CookieConsentBanner";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "";

export default function LandingFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const whatsappHref = buildWhatsAppLink(whatsappNumber, t.whatsappFloat.generic);

  const linkClass =
    "text-sm text-ink-muted underline-offset-2 transition hover:text-sea-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600";

  return (
    <footer className="border-t border-sea-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
            >
              <CoabitoLogo size={32} />
              <span className="font-display text-base font-bold text-ink">Coabito</span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
              {t.footer.tagline}
            </p>
            <LanguageSwitcher />
          </div>

          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wide text-sea-700">
              {t.footer.explore}
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/lista-attesa" className={linkClass}>
                  {t.footer.waitlist}
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkClass}>
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link
                  href="/guida/affittare-casa-studenti-ancona"
                  className={linkClass}
                >
                  {t.footer.guide}
                </Link>
              </li>
              <li>
                <Link
                  href="/guida/prima-volta-fuori-sede"
                  className={linkClass}
                >
                  {t.footer.guideFirstTime}
                </Link>
              </li>
              <li>
                <Link href="/servizi" className={linkClass}>
                  {t.footer.services}
                </Link>
              </li>
              <li>
                <Link href="/esempi" className={linkClass}>
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/proprietari" className={linkClass}>
                  {t.footer.forOwners}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wide text-sea-700">
              {t.footer.legal}
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/privacy" className={linkClass}>
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/termini" className={linkClass}>
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openCookiePreferences()}
                  className={`${linkClass} text-left`}
                >
                  {t.footer.manageCookies}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wide text-sea-700">
              {t.footer.contact}
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:info@coabito.it" className={linkClass}>
                  info@coabito.it
                </a>
              </li>
              {whatsappHref && (
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {t.footer.whatsapp}
                  </a>
                </li>
              )}
              {INSTAGRAM_URL && (
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-sea-100 pt-6 text-xs text-ink-muted">
          © {year} Coabito. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
