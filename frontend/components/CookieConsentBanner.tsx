"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { translations, type Locale } from "@/lib/i18n/translations";

function buildLanguageBlock(locale: Locale) {
  const c = translations[locale].cookieBanner;
  return {
    consentModal: {
      title: c.title,
      description: `${c.description} <a href="/privacy#cookie">${c.privacyLink}</a>.`,
      acceptAllBtn: c.acceptAll,
      acceptNecessaryBtn: c.rejectNonEssential,
      showPreferencesBtn: c.customize,
    },
    preferencesModal: {
      title: c.preferencesTitle,
      acceptAllBtn: c.acceptAll,
      acceptNecessaryBtn: c.rejectNonEssential,
      savePreferencesBtn: c.savePreferences,
      closeIconLabel: c.close,
      sections: [
        {
          title: c.sectionIntroTitle,
          description: c.sectionIntroBody,
        },
        {
          title: c.sectionNecessaryTitle,
          description: c.sectionNecessaryBody,
          linkedCategory: "necessary",
        },
        {
          title: c.sectionAnalyticsTitle,
          description: c.sectionAnalyticsBody,
          linkedCategory: "analytics",
        },
        {
          title: c.sectionMoreTitle,
          description: `${c.sectionMoreBody} <a href="/privacy#cookie">${c.privacyLink}</a>.`,
        },
      ],
    },
  };
}

/**
 * Banner GDPR (vanilla-cookieconsent) + gate di Vercel Analytics.
 * Analytics parte solo dopo consenso alla categoria "analytics".
 */
export default function CookieConsentBanner() {
  const { locale } = useLocale();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncAnalytics = () => {
      setAnalyticsAllowed(CookieConsent.acceptedCategory("analytics"));
    };

    CookieConsent.run({
      cookie: {
        name: "coabito_cc",
        expiresAfterDays: 182,
      },
      guiOptions: {
        consentModal: {
          layout: "box wide",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [{ name: /^_va/ }, { name: /^va/ }],
          },
        },
      },
      language: {
        default: locale,
        translations: {
          it: buildLanguageBlock("it"),
          en: buildLanguageBlock("en"),
        },
      },
      onConsent: syncAnalytics,
      onChange: syncAnalytics,
    });

    syncAnalytics();
    setReady(true);
    // Init una sola volta: il cambio lingua è gestito sotto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    CookieConsent.setLanguage(locale);
  }, [locale, ready]);

  return analyticsAllowed ? <Analytics /> : null;
}

/** Apre il pannello preferenze — usato nel footer. */
export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  try {
    CookieConsent.showPreferences();
  } catch {
    /* plugin non ancora inizializzato */
  }
}
