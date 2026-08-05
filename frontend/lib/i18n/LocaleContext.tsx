"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Locale } from "./translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)[Locale];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const COOKIE_NAME = "coabito_locale";

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "it";
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(it|en)`));
  return (match?.[1] as Locale) ?? "it";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Parte da "it" lato server (nessun cookie disponibile), poi si allinea
  // subito al cookie reale non appena siamo nel browser. Piccolo sfarfallio
  // possibile solo per chi ha già scelto inglese in una visita precedente.
  const [locale, setLocaleState] = useState<Locale>("it");

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000`;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale deve essere usato dentro <LocaleProvider>.");
  }
  return ctx;
}
