"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { trackFunnel } from "@/lib/analytics";
import { waitlistReferralUrl } from "@/lib/waitlist-referral";
import ReferralShare from "@/components/ReferralShare";

type Status = "confirmed" | "already" | "expired" | "invalid";

export default function ConfirmResult({
  status,
  position = null,
  referralCode = null,
}: {
  status: Status;
  position?: number | null;
  referralCode?: string | null;
}) {
  const { t } = useLocale();
  const copy = t.listaAttesa.confirm;
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    if (status === "confirmed" || status === "already") {
      tracked.current = true;
      trackFunnel("waitlist_email_confirmed", { status });
    }
  }, [status]);

  const showPosition =
    (status === "confirmed" || status === "already") &&
    typeof position === "number" &&
    position > 0;

  const title = showPosition
    ? t.listaAttesa.positionHeadline.replace("{n}", String(position))
    : status === "confirmed"
      ? copy.successTitle
      : status === "already"
        ? copy.alreadyTitle
        : status === "expired"
          ? copy.expiredTitle
          : copy.invalidTitle;

  const body = showPosition
    ? t.listaAttesa.successBodyWithPosition.replace("{n}", String(position))
    : status === "confirmed"
      ? copy.successBody
      : status === "already"
        ? copy.alreadyBody
        : status === "expired"
          ? copy.expiredBody
          : copy.invalidBody;

  const tone =
    status === "confirmed" || status === "already"
      ? "bg-sea-50 text-sea-700"
      : "bg-sand-400/20 text-ink";

  const referralUrl =
    referralCode && (status === "confirmed" || status === "already")
      ? waitlistReferralUrl(referralCode)
      : null;

  return (
    <div className={`animate-pop-in rounded-xl2 p-6 text-center shadow-card ${tone}`}>
      <p
        className={`font-display font-bold ${
          showPosition ? "text-2xl" : "text-base"
        }`}
      >
        {title}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
      {referralUrl && <ReferralShare referralUrl={referralUrl} />}
    </div>
  );
}
