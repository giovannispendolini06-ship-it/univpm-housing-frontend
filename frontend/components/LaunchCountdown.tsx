"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import { daysUntilLaunch } from "@/lib/launch";

type Variant = "hero" | "page";

/**
 * Messaggio dinamico verso la data di lancio (prime stanze / AA 2026-27).
 * Solo giorni interi — niente ore/minuti.
 */
export default function LaunchCountdown({
  variant = "hero",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const { t } = useLocale();
  const days = daysUntilLaunch();

  let label: string;
  if (days <= 0) {
    label = t.launchCountdown.arrived;
  } else if (days === 1) {
    label = t.launchCountdown.oneDay;
  } else {
    label = t.launchCountdown.days.replace("{n}", String(days));
  }

  const base =
    variant === "hero"
      ? "text-sm font-medium text-white/75"
      : "text-sm font-medium text-sea-700";

  return (
    <p
      className={`${base} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
