"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

type Status = "confirmed" | "already" | "expired" | "invalid";

export default function ConfirmResult({ status }: { status: Status }) {
  const { t } = useLocale();
  const copy = t.listaAttesa.confirm;

  const title =
    status === "confirmed"
      ? copy.successTitle
      : status === "already"
        ? copy.alreadyTitle
        : status === "expired"
          ? copy.expiredTitle
          : copy.invalidTitle;

  const body =
    status === "confirmed"
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

  return (
    <div className={`animate-pop-in rounded-xl2 p-6 text-center shadow-card ${tone}`}>
      <p className="font-display text-base font-bold">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
