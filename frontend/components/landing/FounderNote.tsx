"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

/**
 * Nota per Giovanni: il testo (in entrambe le lingue) è un punto di
 * partenza scritto da me — cambialo pure con le tue parole vere, in
 * lib/i18n/translations.ts (chiave founderNote). Anche il cerchio con la
 * "G" è un segnaposto: appena hai una foto tua che ti piace, sostituiscila.
 */
export default function FounderNote() {
  const { t } = useLocale();

  return (
    <section className="bg-sea-600">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white font-display text-xl font-bold text-sea-600">
            G
          </div>

          <p className="font-display text-xl leading-relaxed text-white sm:text-2xl">
            &ldquo;{t.founderNote.quote}&rdquo;
          </p>

          <p className="mt-6 text-sm font-medium text-sea-100">
            {t.founderNote.attribution}
          </p>
        </div>
      </div>
    </section>
  );
}
