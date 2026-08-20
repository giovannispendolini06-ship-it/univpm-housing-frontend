"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { completeOnboarding, skipOnboarding } from "./actions";
import { track } from "@/lib/analytics";

type Step = 1 | 2;

export default function OnboardingForm({ role }: { role: "student" | "owner" }) {
  const { t } = useLocale();
  const [step, setStep] = useState<Step>(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function goNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (role === "student" && step === 1) {
      const fd = new FormData(e.currentTarget);
      if (!(fd.get("avatar") instanceof File) || (fd.get("avatar") as File).size === 0) {
        setError(t.onboarding.photoRequired);
        return;
      }
      if (!String(fd.get("phone") ?? "").trim()) {
        setError(t.onboarding.phoneRequired);
        return;
      }
      if (!String(fd.get("fiscal_code") ?? "").trim()) {
        setError(t.onboarding.fiscalRequired);
        return;
      }
      if (!String(fd.get("date_of_birth") ?? "").trim()) {
        setError(t.onboarding.dobRequired);
        return;
      }
      track("onboarding_started", { role, step: 1 });
      setStep(2);
      return;
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    track("onboarding_started", { role, step: role === "student" ? 2 : 1 });
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result?.error) setError(result.error);
      else track("onboarding_completed", { role });
    });
  }

  function handleSkip() {
    setError(null);
    track("onboarding_skipped", { role });
    startTransition(async () => {
      await skipOnboarding();
    });
  }

  return (
    <form
      action={handleSubmit}
      onSubmit={role === "student" && step === 1 ? goNext : undefined}
      className="space-y-5"
    >
      {role === "student" && (
        <p className="text-xs font-medium text-ink-muted">
          {t.onboarding.stepOf
            .replace("{step}", String(step))
            .replace("{total}", "2")}{" "}
          — {step === 1 ? t.onboarding.stepProfile : t.onboarding.stepPrefs}
        </p>
      )}

      <p className="rounded-xl bg-sea-50 px-3 py-2 text-xs text-sea-700">
        {t.onboarding.optionalBanner}
      </p>

      <div className={step === 1 ? "space-y-5" : "hidden"}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sea-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={t.onboarding.profilePhoto}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-sea-300"
              >
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
              required={step === 1}
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
            required={step === 1}
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
            required={step === 1}
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
              required={step === 1}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>
        )}
      </div>

      {role === "student" && step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-ink-muted">{t.onboarding.prefsViaVestaHint}</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {t.onboarding.budgetMax}
            </label>
            <input
              type="number"
              name="budget_max"
              min={100}
              max={2000}
              required
              placeholder="es. 420"
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {t.onboarding.moveInDate}
            </label>
            <input
              type="date"
              name="preferred_move_in_date"
              required
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {t.onboarding.campus}
            </label>
            <select
              name="polo_univpm"
              required
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                {t.onboarding.selectPlaceholder}
              </option>
              <option value="monte_dago">Monte Dago</option>
              <option value="torrette">Torrette</option>
              <option value="centro_economia_giurisprudenza">Centro / Villarey</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {t.onboarding.cleanliness}
            </label>
            <input
              type="number"
              name="cleanliness_level"
              min={1}
              max={5}
              required
              defaultValue={3}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="is_smoker" value="no" defaultChecked />
              {t.onboarding.noSmoke}
            </label>
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="is_smoker" value="yes" />
              {t.onboarding.yesSmoke}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="tolerates_smokers" value="yes" defaultChecked />
              {t.onboarding.tolerateSmokers}
            </label>
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="tolerates_smokers" value="no" />
              {t.onboarding.noSmokeHome}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="has_pets" value="no" defaultChecked />
              {t.onboarding.noPets}
            </label>
            <label className="flex items-center gap-2 text-ink">
              <input type="radio" name="has_pets" value="yes" />
              {t.onboarding.hasPets}
            </label>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs font-semibold text-sea-700 underline"
          >
            {t.onboarding.backToProfile}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-sunset-600" role="alert">
          {error}
        </p>
      )}

      {role === "student" && step === 1 ? (
        <button
          type="submit"
          className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700"
        >
          {t.onboarding.continuePrefs}
        </button>
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
        >
          {isPending ? t.common.oneMoment : t.onboarding.continueButton}
        </button>
      )}

      <button
        type="button"
        onClick={handleSkip}
        disabled={isPending}
        className="w-full text-center text-xs font-semibold text-sea-700 underline underline-offset-2 disabled:opacity-50"
      >
        {t.onboarding.skipForNow}
      </button>
    </form>
  );
}
