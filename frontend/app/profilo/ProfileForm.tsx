"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { updateProgressiveProfile } from "./actions";
import type { ProfileSex } from "@/lib/profile-completion";

export type ProfileFormValues = {
  full_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  place_of_birth: string;
  sex: ProfileSex | "";
  has_guarantor: "yes" | "no" | "";
  fiscal_code: string;
  iban: string;
  company_name: string;
  avatar_url: string | null;
};

export default function ProfileForm({
  role,
  initial,
}: {
  role: "student" | "owner";
  initial: ProfileFormValues;
}) {
  const { t } = useLocale();
  const P = t.profile;
  const [preview, setPreview] = useState<string | null>(initial.avatar_url);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : initial.avatar_url);
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateProgressiveProfile(formData);
      if (result.ok) setMessage(P.saved);
      else setError(result.error);
    });
  }

  const inputClass =
    "w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none";

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sea-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-sea-700">
              {(initial.full_name || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {P.avatarLabel}
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={onFile}
            className="text-xs text-ink-muted file:mr-2 file:rounded-full file:border-0 file:bg-sea-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sea-700"
          />
          <p className="mt-1 text-[11px] text-ink-muted">{P.avatarHint}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {P.firstName}
          </label>
          <input
            name="full_name"
            defaultValue={initial.full_name}
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {P.lastName}
          </label>
          <input
            name="last_name"
            defaultValue={initial.last_name}
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      {role === "owner" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">
            {P.companyName}
          </label>
          <input
            name="company_name"
            defaultValue={initial.company_name}
            className={inputClass}
            placeholder={P.companyPlaceholder}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted">
          {P.phone}
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={initial.phone}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      {role === "student" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                {P.dateOfBirth}
              </label>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={initial.date_of_birth}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                {P.placeOfBirth}
              </label>
              <input
                name="place_of_birth"
                defaultValue={initial.place_of_birth}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {P.sex}
            </label>
            <select name="sex" defaultValue={initial.sex} className={inputClass}>
              <option value="">{P.sexUnset}</option>
              <option value="F">{P.sexF}</option>
              <option value="M">{P.sexM}</option>
              <option value="X">{P.sexX}</option>
              <option value="prefer_not">{P.sexPreferNot}</option>
            </select>
            <p className="mt-1 text-[11px] text-ink-muted">{P.sexHint}</p>
          </div>

          <fieldset>
            <legend className="mb-1 text-xs font-medium text-ink-muted">
              {P.guarantor}
            </legend>
            <div className="flex flex-wrap gap-4 text-sm text-ink">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="has_guarantor"
                  value="yes"
                  defaultChecked={initial.has_guarantor === "yes"}
                />
                {P.guarantorYes}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="has_guarantor"
                  value="no"
                  defaultChecked={initial.has_guarantor === "no"}
                />
                {P.guarantorNo}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="has_guarantor"
                  value=""
                  defaultChecked={initial.has_guarantor === ""}
                />
                {P.guarantorUnset}
              </label>
            </div>
          </fieldset>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {P.fiscalOptional}
            </label>
            <input
              name="fiscal_code"
              defaultValue={initial.fiscal_code}
              className={`${inputClass} uppercase`}
            />
            <p className="mt-1 text-[11px] text-ink-muted">{P.fiscalHint}</p>
          </div>
        </>
      )}

      {role === "owner" && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {P.fiscalOwner}
            </label>
            <input
              name="fiscal_code"
              defaultValue={initial.fiscal_code}
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              {P.iban}
            </label>
            <input
              name="iban"
              defaultValue={initial.iban}
              autoComplete="off"
              className={`${inputClass} uppercase`}
              placeholder="IT60X0542811101000000123456"
            />
            <p className="mt-1 text-[11px] text-ink-muted">{P.ibanHint}</p>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-sunset-600" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-sea-700" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {pending ? t.common.oneMoment : P.save}
      </button>
    </form>
  );
}
