"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export interface MyTenancy {
  startedAt: string;
  roomLabel: string;
  priceMonthly: number;
  estimatedUtilities: number;
  address: string;
  zone: string | null;
  paymentStatus: "da_registrare" | "pagato" | "in_ritardo" | "fallito";
  moveChecklist: string[] | null;
}

const STATUS_STYLES: Record<MyTenancy["paymentStatus"], string> = {
  da_registrare: "bg-white/20 text-white",
  pagato: "bg-white text-sea-700",
  in_ritardo: "bg-sunset-500 text-white",
  fallito: "bg-sunset-500 text-white",
};

export default function MyHomeCard({ tenancy }: { tenancy: MyTenancy }) {
  const { locale, t } = useLocale();
  const [showChecklist, setShowChecklist] = useState(false);
  const total = tenancy.priceMonthly + tenancy.estimatedUtilities;
  const dateLocale = locale === "en" ? "en-GB" : "it-IT";

  const STATUS_LABELS: Record<MyTenancy["paymentStatus"], string> = {
    da_registrare: t.myHomeCard.statusPending,
    pagato: t.myHomeCard.statusPaid,
    in_ritardo: t.myHomeCard.statusLate,
    fallito: t.myPayments.statusFailed,
  };

  return (
    <div className="animate-fade-in-up mx-3 mt-3 rounded-xl2 bg-gradient-to-br from-sea-600 to-sea-700 p-4 text-white shadow-card sm:mx-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold">{t.myHomeCard.title}</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[tenancy.paymentStatus]}`}
        >
          {STATUS_LABELS[tenancy.paymentStatus]}
        </span>
      </div>

      <p className="mt-1 text-xs text-sea-100">
        {tenancy.roomLabel} · {tenancy.address}
        {tenancy.zone ? ` · ${tenancy.zone}` : ""}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-sea-100">{t.myHomeCard.rent}</p>
          <p className="font-display text-base font-bold">{tenancy.priceMonthly}€</p>
        </div>
        <div>
          <p className="text-[10px] text-sea-100">{t.myHomeCard.utilities}</p>
          <p className="font-display text-base font-bold">{tenancy.estimatedUtilities}€</p>
        </div>
        <div className="rounded-lg bg-white/10 py-1">
          <p className="text-[10px] text-sea-100">{t.myHomeCard.totalPerMonth}</p>
          <p className="font-display text-base font-bold">{total}€</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-sea-100">
        {t.myHomeCard.tenantSince.replace(
          "{date}",
          new Date(tenancy.startedAt).toLocaleDateString(dateLocale),
        )}
      </p>

      {tenancy.moveChecklist && tenancy.moveChecklist.length > 0 && (
        <div className="mt-3 border-t border-white/15 pt-3">
          <button
            onClick={() => setShowChecklist((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-semibold text-white"
          >
            <span>{t.myHomeCard.checklistTitle}</span>
            <span className={`transition-transform ${showChecklist ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showChecklist && (
            <ul className="mt-2 space-y-1.5">
              {tenancy.moveChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-sea-50">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
