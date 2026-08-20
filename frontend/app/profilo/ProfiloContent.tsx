"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { VerificationStatus } from "@/lib/verification";
import VerificationPanel from "@/components/VerificationPanel";
import ProfileCompletionRing from "@/components/profile/ProfileCompletionRing";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import ProfileForm, { type ProfileFormValues } from "./ProfileForm";
import type { ProfileCompletion } from "@/lib/profile-completion";

type LifestyleSnap = {
  budget_max: number | null;
  preferred_move_in_date: string | null;
  polo_univpm: string | null;
  cleanliness_level: number | null;
  sociability_level: number | null;
  is_smoker: boolean | null;
  has_pets: boolean | null;
} | null;

export default function ProfiloContent({
  role,
  email,
  displayName,
  completion,
  formInitial,
  verificationStatus,
  lifestyle,
  homeHref,
}: {
  role: "student" | "owner" | "admin";
  email: string | null;
  displayName: string;
  completion: ProfileCompletion;
  formInitial: ProfileFormValues | null;
  verificationStatus: VerificationStatus;
  lifestyle: LifestyleSnap;
  homeHref: string;
}) {
  const { t } = useLocale();
  const P = t.profile;
  const isStudent = role === "student";
  const isOwner = role === "owner";

  return (
    <div className="px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{P.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{P.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card">
          <ProfileCompletionRing percent={completion.percent} />
          <div className="max-w-[11rem]">
            <p className="font-display text-sm font-bold text-ink">
              {P.completionLabel.replace("{n}", String(completion.percent))}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              {P.completionMeta
                .replace("{filled}", String(completion.filled))
                .replace("{total}", String(completion.total))}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-4 rounded-xl2 bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-bg pb-3">
          <p className="font-display text-lg font-bold text-ink">{displayName}</p>
          <span className="rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sea-700">
            {role}
          </span>
          <p className="w-full text-sm text-ink-muted">{email}</p>
        </div>

        {formInitial && (isStudent || isOwner) && (
          <ProfileForm role={isOwner ? "owner" : "student"} initial={formInitial} />
        )}
      </section>

      {(isStudent || isOwner) && (
        <div className="mb-4">
          <VerificationPanel
            role={isOwner ? "owner" : "student"}
            status={verificationStatus}
            email={email}
          />
          {isOwner && (
            <p className="mt-2 px-1 text-[11px] text-ink-muted">{P.ownerDocHint}</p>
          )}
        </div>
      )}

      {isStudent && (
        <section className="mt-4 rounded-xl2 bg-white p-5 shadow-card">
          <h2 className="font-display text-sm font-bold text-ink">{P.lifestyleTitle}</h2>
          <p className="mt-1 text-xs text-ink-muted">{P.lifestyleHint}</p>
          {lifestyle ? (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">{P.budget}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.budget_max != null ? `${lifestyle.budget_max}€` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{P.moveIn}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.preferred_move_in_date ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{P.campus}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.polo_univpm ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{P.cleanliness}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.cleanliness_level ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{P.social}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.sociability_level ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{P.smokePets}</dt>
                <dd className="font-medium text-ink">
                  {lifestyle.is_smoker ? P.smokes : P.noSmoke}
                  {" · "}
                  {lifestyle.has_pets ? P.petsYes : P.petsNo}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">{P.lifestyleEmpty}</p>
          )}
          <Link
            href="/vesta"
            className="mt-4 inline-flex rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sea-700"
          >
            {P.openVesta}
          </Link>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-sea-100 pt-6">
        <SignOutButton className="rounded-full bg-sea-50 px-4 py-2 text-sm font-semibold text-ink" />
        <DeleteAccountButton
          isOwner={role === "owner"}
          className="text-xs text-ink-muted underline underline-offset-2 hover:text-sunset-600"
        />
        {!isStudent && (
          <Link href={homeHref} className="text-sm text-sea-700 underline">
            {P.backHome}
          </Link>
        )}
      </div>
    </div>
  );
}
