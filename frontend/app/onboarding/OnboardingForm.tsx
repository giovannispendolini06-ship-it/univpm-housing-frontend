"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { completeOnboarding } from "./actions";

export default function OnboardingForm({ role }: { role: "student" | "owner" }) {
  const { t } = useLocale();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sea-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sea-300">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.onboarding.profilePhoto}
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="text-xs text-ink-muted file:mr-2 file:rounded-full file:border-0 file:bg-sea-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sea-700"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {t.onboarding.phoneNumber}
        </label>
        <input
          type="tel"
          name="phone"
          required
          placeholder={t.onboarding.phonePlaceholder}
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {role === "owner" ? t.onboarding.fiscalCodeOwner : t.onboarding.fiscalCodeStudent}
        </label>
        <input
          type="text"
          name="fiscal_code"
          required
          className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm uppercase focus:border-sea-400 focus:outline-none"
        />
      </div>

      {role === "student" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {t.onboarding.dateOfBirth}
          </label>
          <input
            type="date"
            name="date_of_birth"
            required
            className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
          />
        </div>
      )}

      {error && <p className="text-sm text-sunset-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
      >
        {isPending ? t.common.oneMoment : t.onboarding.continueButton}
      </button>
    </form>
  );
}
