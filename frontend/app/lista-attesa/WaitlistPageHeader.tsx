"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import Reveal from "@/components/landing/Reveal";

export default function WaitlistPageHeader() {
  const { t } = useLocale();

  return (
    <Reveal>
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-ink-muted underline underline-offset-2"
      >
        {t.listaAttesa.backToHome}
      </Link>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">
        {t.listaAttesa.title}
      </h1>
      <p className="mb-8 text-base text-ink-muted">{t.listaAttesa.subtitle}</p>
    </Reveal>
  );
}
