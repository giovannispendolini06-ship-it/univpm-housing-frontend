"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { trackFunnel } from "@/lib/analytics";
import { getLaunchMonthLabel } from "@/lib/launch";
import { ITALY_VACANT_HOMES_LABEL } from "@/lib/waitlist-constants";
import { getCityBySlug } from "@/lib/geo/catalog";
import { waitlistReferralUrl } from "@/lib/waitlist-referral";
import ReferralShare from "@/components/ReferralShare";
import { submitWaitlistSignup } from "./actions";
import styles from "./WaitlistSection.module.css";

const SOURCE_MAP: Record<string, string> = {
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
};

function resolveSourceParam(src: string | null): string {
  if (!src) return "lista_attesa";
  return SOURCE_MAP[src] ?? "lista_attesa";
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="#4ADE80"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function WaitlistForm() {
  const { t, locale } = useLocale();
  const L = t.listaAttesa;
  const searchParams = useSearchParams();
  const source = resolveSourceParam(searchParams.get("src"));
  const refCode = searchParams.get("ref")?.trim() || "";
  const cityParam = searchParams.get("city")?.trim().toLowerCase() || "";
  const cityFromCatalog = cityParam ? getCityBySlug(cityParam) : undefined;
  const citySlug = cityFromCatalog?.slug ?? "";
  const cityName = cityFromCatalog?.name ?? "";
  const cityComingSoon = cityFromCatalog?.status === "coming_soon";

  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<"pending" | "ok" | null>(
    null,
  );
  const [position, setPosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [renderedAt] = useState(() => Date.now());
  const formStartedRef = useRef(false);

  const launchMonth = getLaunchMonthLabel(locale);
  const eyebrow = L.eyebrow.replace("{month}", launchMonth);
  const titleBefore = L.titleBefore;
  const titleAccent = L.titleAccent;
  const titleAfter = L.titleAfter;

  function markFormStarted() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackFunnel("waitlist_form_started");
  }

  function resolveError(code: string): string {
    if (code === "contactRequired") return L.contactRequired;
    if (code === "privacyRequired") return L.privacyRequired;
    if (code === "errorGeneric") return L.errorGeneric;
    return code;
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitWaitlistSignup(formData);
      if (result?.error) {
        setError(resolveError(result.error));
      } else {
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

  function SuccessBlock() {
    if (successStatus === "pending") {
      return (
        <div className={styles.successCard}>
          <p className={styles.successTitle}>{L.pendingTitle}</p>
          <p className={styles.successBody}>{L.pendingBody}</p>
          {referralUrl && <ReferralShare referralUrl={referralUrl} />}
        </div>
      );
    }

    const body =
      position && position > 0
        ? L.successBodyWithPosition.replace("{n}", String(position))
        : L.successBody;

    return (
      <div className={styles.successCard}>
        {position && position > 0 ? (
          <p className={styles.successTitle}>
            {L.positionHeadline.replace("{n}", String(position))}
          </p>
        ) : (
          <p className={styles.successTitle}>{L.successTitle}</p>
        )}
        <p className={styles.successBody}>{body}</p>
        {referralUrl && <ReferralShare referralUrl={referralUrl} />}
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          {L.backToHome}
        </Link>

        <div className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          {eyebrow}
        </div>

        <h1 className={styles.title}>
          {titleBefore}
          <span className={styles.accent}>{titleAccent}</span>
          {titleAfter}
        </h1>
        <p className={styles.sub}>
          {cityComingSoon && cityName
            ? L.subtitleCity
                .replace("{city}", cityName)
                .replace("{status}", L.comingSoonLabel)
            : L.subtitle}
        </p>

        {successStatus ? (
          <SuccessBlock />
        ) : (
          <>
            <form
              action={handleSubmit}
              className={styles.formCard}
              onFocusCapture={markFormStarted}
            >
              <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                <label htmlFor="website">Non compilare questo campo</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <input type="hidden" name="rendered_at" value={renderedAt} />
              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="privacy" value="on" />
              <input type="hidden" name="light" value="1" />
              {citySlug ? <input type="hidden" name="city" value={citySlug} /> : null}
              {refCode ? <input type="hidden" name="ref" value={refCode} /> : null}

              <label htmlFor="waitlist-email" className="sr-only">
                {L.emailLabel}
              </label>
              <input
                id="waitlist-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={L.emailPlaceholder}
              />
              <button type="submit" disabled={isPending}>
                {isPending ? L.submitting : L.submit}
              </button>
            </form>

            <p className={styles.privacy}>
              {L.privacyLightPrefix}{" "}
              <Link href="/privacy">{L.privacyLink}</Link>
              {L.privacyLightSuffix}
            </p>

            {error && <p className={styles.error}>{error}</p>}
          </>
        )}

        <div className={styles.trustRow}>
          {L.trustItems.map((item) => (
            <div key={item} className={styles.trustItem}>
              <CheckIcon />
              {item}
            </div>
          ))}
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{ITALY_VACANT_HOMES_LABEL}</div>
            <div className={styles.statLabel}>{L.statVacantHomes}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{launchMonth}</div>
            <div className={styles.statLabel}>{L.statLaunch}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{L.statFeesValue}</div>
            <div className={styles.statLabel}>{L.statFees}</div>
          </div>
        </div>
        <p className={styles.statFootnote}>{L.statStudentsQualitative}</p>
      </div>
    </section>
  );
}
