"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { submitOwnerInquiry } from "./actions";

type FieldKey = "full_name" | "phone" | "email" | "form";

function fieldClass(hasError: boolean): string {
  return `w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-600 ${
    hasError
      ? "border-sunset-500 focus:border-sunset-500"
      : "border-sea-100 focus:border-sea-400"
  }`;
}

export default function OwnerInquiryForm() {
  const { t } = useLocale();
  const copy = t.ownerInquiry;
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => Date.now());

  function resolveError(code: string): string {
    if (code === "nameRequired") return copy.nameRequired;
    if (code === "phoneRequired") return copy.phoneRequired;
    if (code === "emailInvalid") return copy.emailInvalid;
    if (code === "rateLimited") return copy.rateLimited;
    if (code === "errorGeneric") return copy.errorGeneric;
    return code;
  }

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitOwnerInquiry(formData);
      if (result?.error) {
        const message = resolveError(result.error);
        const field = (result.field ?? "form") as FieldKey;
        setFieldErrors({ [field]: message });
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="animate-pop-in rounded-xl2 bg-sea-50 p-6 text-center shadow-card">
        <p className="font-display text-base font-bold text-sea-700">
          {copy.successTitle}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-xl2 bg-surface p-6 shadow-card"
      noValidate
    >
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Non compilare questo campo</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} />

      <div>
        <label htmlFor="owner-name" className="mb-1 block text-xs font-medium text-ink-muted">
          {copy.nameLabel}
        </label>
        <input
          id="owner-name"
          type="text"
          name="full_name"
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.full_name)}
          className={fieldClass(Boolean(fieldErrors.full_name))}
        />
        {fieldErrors.full_name && (
          <p className="mt-1 text-xs text-sunset-600">{fieldErrors.full_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="owner-phone" className="mb-1 block text-xs font-medium text-ink-muted">
          {copy.phoneLabel}
        </label>
        <input
          id="owner-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.phone)}
          className={fieldClass(Boolean(fieldErrors.phone))}
        />
        {fieldErrors.phone && (
          <p className="mt-1 text-xs text-sunset-600">{fieldErrors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="owner-email" className="mb-1 block text-xs font-medium text-ink-muted">
          {copy.emailLabel}
        </label>
        <input
          id="owner-email"
          type="email"
          name="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          className={fieldClass(Boolean(fieldErrors.email))}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-sunset-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {copy.addressLabel}
        </label>
        <input
          type="text"
          name="property_address"
          placeholder={copy.addressPlaceholder}
          className={fieldClass(false)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {copy.messageLabel}
        </label>
        <textarea
          name="message"
          rows={3}
          className={fieldClass(false)}
        />
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
        {isPending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
