"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { trackFunnel } from "@/lib/analytics";
import { waitlistReferralUrl } from "@/lib/waitlist-referral";
import ReferralShare from "@/components/ReferralShare";
import { markWaitlistJoined } from "@/lib/announce-bar";
import { submitWaitlistSignup } from "./actions";

const SOURCE_MAP: Record<string, string> = {
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
};

type FieldKey = "nome" | "email" | "phone" | "privacy" | "form";

function resolveSourceParam(src: string | null): string {
  if (!src) return "lista_attesa";
  return SOURCE_MAP[src] ?? "lista_attesa";
}

function fieldClass(hasError: boolean): string {
  return `w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600 ${
    hasError
      ? "border-sunset-500 focus:border-sunset-500"
      : "border-sea-100 focus:border-sea-400"
  }`;
}

export default function WaitlistForm() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const source = resolveSourceParam(searchParams.get("src"));
  const refCode = searchParams.get("ref")?.trim() || "";

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [successStatus, setSuccessStatus] = useState<"pending" | "ok" | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => Date.now());
  const formStartedRef = useRef(false);

  function markFormStarted() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackFunnel("waitlist_form_started");
  }

  function resolveError(code: string): string {
    if (code === "nameRequired") return t.listaAttesa.nameRequired;
    if (code === "contactRequired") return t.listaAttesa.contactRequired;
    if (code === "emailInvalid") return t.listaAttesa.emailInvalid;
    if (code === "privacyRequired") return t.listaAttesa.privacyRequired;
    if (code === "errorGeneric") return t.listaAttesa.errorGeneric;
    return code;
  }

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitWaitlistSignup(formData);
      if (result?.error) {
        const message = resolveError(result.error);
        const field = (result.field ?? "form") as FieldKey;
        setFieldErrors({ [field]: message });
      } else {
        markWaitlistJoined();
        setSuccessStatus(result?.status === "pending" ? "pending" : "ok");
        setPosition(typeof result?.position === "number" ? result.position : null);
        setReferralCode(result?.referralCode ?? null);
        trackFunnel("waitlist_signup_completed", {
          source,
          status: result?.status === "pending" ? "pending" : "confirmed",
        });
      }
    });
  }

  const referralUrl = referralCode ? waitlistReferralUrl(referralCode) : null;

  if (successStatus === "pending") {
    return (
      <div className="animate-pop-in rounded-xl2 bg-sea-50 p-6 text-center shadow-card">
        <p className="font-display text-base font-bold text-sea-700">
          {t.listaAttesa.pendingTitle}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{t.listaAttesa.pendingBody}</p>
        {referralUrl && <ReferralShare referralUrl={referralUrl} />}
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
        {referralUrl && <ReferralShare referralUrl={referralUrl} />}
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-xl2 bg-surface p-6 shadow-card"
      onFocusCapture={markFormStarted}
      noValidate
    >
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Non compilare questo campo</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="locale" value={locale} />
      {refCode ? <input type="hidden" name="ref" value={refCode} /> : null}

      <div>
        <label htmlFor="waitlist-nome" className="mb-1 block text-xs font-medium text-ink-muted">
          {t.listaAttesa.nameLabel}
        </label>
        <input
          id="waitlist-nome"
          type="text"
          name="nome"
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.nome)}
          aria-describedby={fieldErrors.nome ? "waitlist-nome-error" : undefined}
          className={fieldClass(Boolean(fieldErrors.nome))}
        />
        {fieldErrors.nome && (
          <p id="waitlist-nome-error" className="mt-1 text-xs text-sunset-600">
            {fieldErrors.nome}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="waitlist-email" className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.emailLabel}
          </label>
          <input
            id="waitlist-email"
            type="email"
            name="email"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "waitlist-email-error" : undefined}
            className={fieldClass(Boolean(fieldErrors.email))}
          />
          {fieldErrors.email && (
            <p id="waitlist-email-error" className="mt-1 text-xs text-sunset-600">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="waitlist-phone" className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.phoneLabel}
          </label>
          <input
            id="waitlist-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            className={fieldClass(Boolean(fieldErrors.phone))}
          />
        </div>
      </div>
      <p className="text-xs text-ink-muted">{t.listaAttesa.contactHint}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.listaAttesa.facoltaLabel}
          </label>
          <select name="facolta" className={fieldClass(false)}>
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
          <select name="polo" className={fieldClass(false)}>
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
          className={fieldClass(false)}
        />
      </div>

      <div>
        <label className="flex items-start gap-2 text-xs text-ink-muted">
          <input
            type="checkbox"
            name="privacy"
            aria-invalid={Boolean(fieldErrors.privacy)}
            className="mt-0.5 rounded border-sea-200"
          />
          <span>
            {t.listaAttesa.privacyPrefix}{" "}
            <Link href="/privacy" className="text-sea-700 underline">
              {t.listaAttesa.privacyLink}
            </Link>
          </span>
        </label>
        {fieldErrors.privacy && (
          <p className="mt-1 text-xs text-sunset-600">{fieldErrors.privacy}</p>
        )}
      </div>

      {fieldErrors.form && (
        <p className="text-sm text-sunset-600" role="alert">
          {fieldErrors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600"
      >
        {isPending ? t.listaAttesa.submitting : t.listaAttesa.submit}
      </button>
    </form>
  );
}
