"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { RentPaymentStatus, StudentPaymentSummary } from "@/lib/rent-payments";

interface MyPaymentsSectionProps {
  studentId: string;
}

const BADGE: Record<RentPaymentStatus, string> = {
  pagato: "bg-sea-600 text-white",
  da_registrare: "bg-sunset-500/20 text-sunset-600",
  in_ritardo: "bg-sunset-500 text-white",
  fallito: "bg-sunset-500 text-white",
};

export default function MyPaymentsSection({ studentId }: MyPaymentsSectionProps) {
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-GB" : "it-IT";
  const [tenancyId, setTenancyId] = useState<string | null>(null);
  const [nextPayment, setNextPayment] = useState<StudentPaymentSummary | null>(null);
  const [payments, setPayments] = useState<StudentPaymentSummary[]>([]);
  const [stripeReady, setStripeReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/my-payments?studentId=${studentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTenancyId(data.tenancyId ?? null);
        setNextPayment(data.nextPayment ?? null);
        setPayments(data.payments ?? []);
        setStripeReady(Boolean(data.stripeReady));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (!loaded || !tenancyId || !nextPayment) return null;

  const statusLabels: Record<RentPaymentStatus, string> = {
    pagato: t.myPayments.statusPaid,
    da_registrare: t.myPayments.statusDue,
    in_ritardo: t.myPayments.statusLate,
    fallito: t.myPayments.statusFailed,
  };

  const history = payments.filter((p) => p.periodMonth !== nextPayment.periodMonth);
  const canPay =
    nextPayment.status !== "pagato" &&
    (nextPayment.status === "da_registrare" ||
      nextPayment.status === "in_ritardo" ||
      nextPayment.status === "fallito");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const wa = buildWhatsAppLink(
    whatsappNumber,
    t.myPayments.whatsappMessage,
  );

  function handlePay() {
    setError(null);
    if (!stripeReady) {
      setShowFallback(true);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenancyId }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "STRIPE_NOT_CONFIGURED") {
            setShowFallback(true);
            return;
          }
          setError(data.error ?? t.myPayments.payError);
          return;
        }
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError(t.myPayments.payError);
      } catch {
        setError(t.myPayments.payError);
      }
    });
  }

  function formatPeriod(periodMonth: string) {
    return new Date(periodMonth + "T12:00:00").toLocaleDateString(dateLocale, {
      month: "long",
      year: "numeric",
    });
  }

  function formatMoney(n: number) {
    return `${Number(n).toLocaleString(dateLocale)}€`;
  }

  return (
    <section className="animate-fade-in-up mx-3 mt-3 rounded-xl2 bg-surface p-4 shadow-card sm:mx-4">
      <h2 className="font-display text-sm font-bold text-ink">{t.myPayments.title}</h2>

      {/* Prossimo pagamento */}
      <div className="mt-3 rounded-xl border border-sea-100 bg-sea-50/40 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              {t.myPayments.nextPayment}
            </p>
            <p className="mt-0.5 font-display text-2xl font-bold text-ink">
              {formatMoney(nextPayment.amountDue)}
            </p>
            <p className="text-xs text-ink-muted">
              {t.myPayments.dueBy.replace(
                "{date}",
                new Date(nextPayment.dueDate + "T12:00:00").toLocaleDateString(dateLocale),
              )}
              {" · "}
              {formatPeriod(nextPayment.periodMonth)}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE[nextPayment.status]}`}
          >
            {statusLabels[nextPayment.status]}
          </span>
        </div>

        {canPay && (
          <button
            type="button"
            onClick={handlePay}
            disabled={isPending}
            className="mt-3 w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50"
          >
            {isPending ? t.myPayments.paying : t.myPayments.payNow}
          </button>
        )}

        {showFallback && (
          <div
            role="status"
            className="mt-3 rounded-xl border border-sunset-500/30 bg-sunset-500/10 px-3 py-2.5 text-sm text-ink"
          >
            <p>{t.myPayments.stripeSoon}</p>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold text-white"
              >
                {t.myPayments.whatsappCta}
              </a>
            )}
            {!wa && (
              <a
                href="mailto:info@coabito.it"
                className="mt-2 inline-block text-xs font-semibold text-sea-700 underline"
              >
                info@coabito.it
              </a>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="mt-2 text-xs text-sunset-600">
            {error}
          </p>
        )}
      </div>

      {/* Storico */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t.myPayments.history}
        </h3>
        {history.length === 0 && payments.filter((p) => p.status === "pagato").length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">{t.myPayments.historyEmpty}</p>
        ) : (
          <ul className="mt-2 divide-y divide-sea-50">
            {(history.length > 0 ? history : payments.filter((p) => p.status === "pagato")).map(
              (p) => (
                <li
                  key={p.id ?? p.periodMonth}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {formatPeriod(p.periodMonth)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatMoney(p.amountDue)}
                      {p.paidAt
                        ? ` · ${new Date(p.paidAt + "T12:00:00").toLocaleDateString(dateLocale)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE[p.status]}`}
                    >
                      {statusLabels[p.status]}
                    </span>
                    {p.invoiceUrl && (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-sea-700 underline underline-offset-2"
                      >
                        {t.myPayments.receipt}
                      </a>
                    )}
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
