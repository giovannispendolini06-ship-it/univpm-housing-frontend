"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-full border border-sea-100 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLocale("it")}
        aria-label="Italiano"
        className={`rounded-full px-2 py-1 transition ${
          locale === "it" ? "bg-sea-600 text-white" : "text-ink-muted"
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale("en")}
        aria-label="English"
        className={`rounded-full px-2 py-1 transition ${
          locale === "en" ? "bg-sea-600 text-white" : "text-ink-muted"
        }`}
      >
        EN
      </button>
    </div>
  );
}
