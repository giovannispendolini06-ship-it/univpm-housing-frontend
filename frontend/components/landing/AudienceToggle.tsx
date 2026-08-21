"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export type Audience = "student" | "owner";

/**
 * Interruttore Studente / Proprietario — stesso pattern del riferimento
 * FAQ e riusabile dove serve lo switch di audience (es. Come funziona).
 */
export default function AudienceToggle({
  value,
  onChange,
  className = "",
  labels,
}: {
  value: Audience;
  onChange: (next: Audience) => void;
  className?: string;
  /** Optional override; defaults to faq.toggleStudent / toggleOwner */
  labels?: { student: string; owner: string };
}) {
  const { t } = useLocale();
  const studentLabel = labels?.student ?? t.faq.toggleStudent;
  const ownerLabel = labels?.owner ?? t.faq.toggleOwner;

  return (
    <div
      className={`inline-flex rounded-[14px] bg-white p-1.5 shadow-[0_6px_18px_rgba(15,62,57,0.08)] ${className}`}
      role="group"
      aria-label={t.faq.toggleAria}
    >
      <button
        type="button"
        onClick={() => onChange("student")}
        aria-pressed={value === "student"}
        className={`rounded-[10px] px-5 py-2.5 text-[13px] font-bold transition-all duration-[350ms] motion-reduce:transition-none ${
          value === "student"
            ? "bg-sea-600 text-white"
            : "text-ink-muted hover:text-ink"
        }`}
        style={
          value === "student"
            ? { transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)" }
            : undefined
        }
      >
        {studentLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("owner")}
        aria-pressed={value === "owner"}
        className={`rounded-[10px] px-5 py-2.5 text-[13px] font-bold transition-all duration-[350ms] motion-reduce:transition-none ${
          value === "owner"
            ? "bg-sunset-500 text-white"
            : "text-ink-muted hover:text-ink"
        }`}
        style={
          value === "owner"
            ? { transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)" }
            : undefined
        }
      >
        {ownerLabel}
      </button>
    </div>
  );
}
