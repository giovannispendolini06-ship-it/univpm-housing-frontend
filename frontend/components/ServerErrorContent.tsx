"use client";

import Link from "next/link";
import CoabitoLogo from "@/components/CoabitoLogo";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function ServerErrorContent({
  reset,
}: {
  reset?: () => void;
}) {
  const { t } = useLocale();
  const copy = t.serverError;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_700px_400px_at_50%_0%,rgba(15,110,106,0.16),transparent_70%),radial-gradient(ellipse_500px_300px_at_80%_100%,rgba(255,107,74,0.1),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <CoabitoLogo size={48} />
        </div>
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-sunset-500">
          Oops
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{copy.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-full bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
            >
              {copy.retry}
            </button>
          )}
          <Link
            href="/"
            className="inline-flex rounded-full border border-sea-200 bg-white px-5 py-2.5 text-sm font-semibold text-sea-700 transition hover:bg-sea-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
          >
            {copy.home}
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          <a
            href="mailto:info@coabito.it"
            className="font-medium text-sea-700 underline underline-offset-2"
          >
            {copy.contact}
          </a>
        </p>
      </div>
    </main>
  );
}
