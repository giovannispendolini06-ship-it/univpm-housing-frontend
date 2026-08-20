"use client";

import { useEffect } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

/**
 * Fallback quando fallisce il root layout (niente LocaleProvider).
 * Copy in italiano di default; link chiari senza dipendere da i18n.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="it" className={`${display.variable} ${body.variable}`}>
      <body className="bg-bg font-body text-ink antialiased">
        <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_700px_400px_at_50%_0%,rgba(15,110,106,0.16),transparent_70%),radial-gradient(ellipse_500px_300px_at_80%_100%,rgba(255,107,74,0.1),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-md text-center">
            <p className="font-display text-2xl font-bold text-sea-700">Coabito</p>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">
              Qualcosa non ha funzionato
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Si è verificato un problema temporaneo. Riprova tra poco: se
              persiste, scrivici a info@coabito.it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Riprova
              </button>
              <a
                href="/"
                className="inline-flex rounded-full border border-sea-200 bg-white px-5 py-2.5 text-sm font-semibold text-sea-700"
              >
                Torna alla home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
