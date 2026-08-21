"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

/**
 * Progress ring for profile completion.
 * Respects prefers-reduced-motion (static ring, no stroke animation).
 */
export default function ProfileCompletionRing({
  percent,
  size = 88,
}: {
  percent: number;
  size?: number;
}) {
  const { t } = useLocale();
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={t.profile.completionAria.replace("{n}", String(p))}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-sea-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-sea-600 motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
        />
      </svg>
      <span className="absolute font-display text-lg font-bold text-ink tabular-nums">
        {p}%
      </span>
    </div>
  );
}
