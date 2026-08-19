"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { GuaranteedPropertySummary } from "@/lib/owner/guaranteed-payout";
import {
  formatPayoutDateEN,
  formatPayoutDateIT,
  nextGuaranteedPayoutDate,
} from "@/lib/owner/guaranteed-payout";

export default function GuaranteedRentWidget({
  properties,
  totalMonthly,
}: {
  properties: GuaranteedPropertySummary[];
  totalMonthly: number;
}) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  if (properties.length === 0) return null;

  const payoutDate = nextGuaranteedPayoutDate();
  const dateLabel =
    locale === "en" ? formatPayoutDateEN(payoutDate) : formatPayoutDateIT(payoutDate);
  const allOccupied = properties.every((p) => p.occupied);
  const anyOccupied = properties.some((p) => p.occupied);

  const statusLine = allOccupied
    ? t.ownerDashboard.widgetAllOccupied
    : anyOccupied
      ? t.ownerDashboard.widgetMixed
      : t.ownerDashboard.widgetSearching;

  return (
    <section className="mb-6 rounded-xl2 border border-sea-100 bg-white p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sea-700">
        {t.ownerDashboard.widgetEyebrow}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-ink-muted">{t.ownerDashboard.nextPayout}</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">
            {totalMonthly.toLocaleString(locale === "en" ? "en-GB" : "it-IT")}€
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t.ownerDashboard.expectedOn.replace("{date}", dateLabel)}
          </p>
        </div>
        <p className="max-w-xs text-right text-sm font-medium text-sea-700">{statusLine}</p>
      </div>

      {properties.length > 1 && (
        <div className="mt-4 border-t border-bg pt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-semibold text-sea-700 underline"
            aria-expanded={open}
          >
            {open ? t.ownerDashboard.hideDetail : t.ownerDashboard.showDetail}
          </button>
          {open && (
            <ul className="mt-3 space-y-2">
              {properties.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="text-ink">{p.zoneLabel}</span>
                  <span className="tabular-nums font-semibold text-ink">
                    {p.monthlyAmount}€
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      {p.occupied
                        ? t.ownerDashboard.occupied
                        : t.ownerDashboard.searchingTenant}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
