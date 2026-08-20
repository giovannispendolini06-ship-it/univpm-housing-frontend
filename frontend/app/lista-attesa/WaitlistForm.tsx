"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { markWaitlistJoined } from "@/lib/announce-bar";
import { submitWaitlistSignup } from "./actions";

const SOURCE_MAP: Record<string, string> = {
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
};

function resolveSourceParam(src: string | null): string {
  if (!src) return "lista_attesa";
  return SOURCE_MAP[src] ?? "lista_attesa";
}

export default function WaitlistForm() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const source = resolveSourceParam(searchParams.get("src"));

  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<"pending" | "ok" | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => Date.now());

  function resolveError(code: string): string {
    if (code === "contactRequired") return t.listaAttesa.contactRequired;
    if (code === "privacyRequired") return t.listaAttesa.privacyRequired;
    if (code === "errorGeneric") return t.listaAttesa.errorGeneric;
    return code;
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitWaitlistSignup(formData);
      if (result?.error) {
        setError(resolveError(result.error));
      } else {
        markWaitlistJoined();
        setSuccessStatus(result?.status === "pending" ? "pending" : "ok");
        setPosition(typeof result?.position === "number" ? result.position : null);
      }
    });
  }

  if (successStatus === "pending") {
    return (
      <div className="animate-pop-in rounded-xl2 bg-sea-50 p-6 text-center shadow-card">
        <p className="font-display text-base font-bold text-sea-700">
          {t.listaAttesa.pendingTitle}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{t.listaAttesa.pendingBody}</p>
      </div>
    );
  }

  if (successStatus === "ok") {
    const body =
      position && position > 0
        ? t.listaAttesa.successBodyWithPosition.replace("{n}", String(position))
        : t.listaAttesa.successBody;

    return (
      <div className="animate-pop-in rounded-xl2 bg-sea-50 p-6 text-center shadow-card">
        {position && position > 0 ? (
          <p className="font-display text-2xl font-bold text-sea-700">
            {t.listaAttesa.positionHeadline.replace("{n}", String(position))}
          </p>
        ) : (
          <p className="font-display text-base font-bold text-sea-700">
            {t.listaAttesa.successTitle}
          </p>
        )}
        <p className="mt-2 text-sm text-ink-muted">{body}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl2 bg-surface p-6 shadow-card">
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Non compilare questo campo</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {t.listaAttesa.nameLabel}
        </label>
        <input
          type="text"
          name="nome"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.emailLabel}
          </label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.phoneLabel}
          </label>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          />
        </div>
      </div>
      <p className="text-xs text-ink-muted">{t.listaAttesa.contactHint}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.facoltaLabel}
          </label>
          <select
            name="facolta"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          >
            <option value="">—</option>
            {t.listaAttesa.facoltaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.poloLabel}
          </label>
          <select
            name="polo"
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          >
            <option value="">—</option>
            {t.listaAttesa.poloOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {t.listaAttesa.budgetLabel}
        </label>
        <input
          type="number"
          name="budget"
          min={0}
          step={50}
          placeholder="Es. 350"
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-ink-muted">
        <input
          type="checkbox"
          name="privacy"
          required
          className="mt-0.5 rounded border-sea-200"
        />
        <span>
          {t.listaAttesa.privacyPrefix}{" "}
          <Link href="/privacy" className="text-sea-700 underline">
            {t.listaAttesa.privacyLink}
          </Link>
        </span>
      </label>

      {error && <p className="text-sm text-sunset-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
      >
        {isPending ? t.listaAttesa.submitting : t.listaAttesa.submit}
      </button>
    </form>
  );
}
