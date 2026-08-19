"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import {
  formatEscrowAmount,
  isEscrowLive,
  type EscrowCoverage,
  type EscrowStatus,
} from "@/lib/escrow";

type Role = "student" | "owner";

/**
 * Escrow panel — always shows inactive banner while ESCROW_LIVE is false.
 * Confirm buttons stay disabled; no Stripe calls.
 */
export default function EscrowStatusPanel({
  role,
  status = "pending",
  amountCents,
  firstMonthCents,
  depositCents,
  coverage,
  roomLabel,
}: {
  role: Role;
  status?: EscrowStatus;
  /** Total illustrative amount (cents); not charged */
  amountCents?: number | null;
  firstMonthCents?: number | null;
  depositCents?: number | null;
  coverage?: EscrowCoverage | null;
  roomLabel?: string | null;
}) {
  const { t, locale } = useLocale();
  const live = isEscrowLive();
  const E = t.escrow;
  const loc = locale === "en" ? "en" : "it";

  const statusLabel =
    status === "released"
      ? E.statusReleased
      : status === "disputed"
        ? E.statusDisputed
        : status === "refunded"
          ? E.statusRefunded
          : E.statusPending;

  const coverageLabel =
    coverage === "first_month"
      ? E.coverageFirstMonth
      : coverage === "deposit"
        ? E.coverageDeposit
        : coverage === "first_month_and_deposit"
          ? E.coverageBoth
          : null;

  const body = role === "student" ? E.studentPendingCopy : E.ownerPendingCopy;

  return (
    <section
      className="rounded-xl2 border border-dashed border-sea-200 bg-bg px-4 py-3"
      aria-label={E.title}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-sm font-bold text-ink">{E.title}</h3>
        {!live && (
          <span className="rounded-full bg-sand-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
            {E.notLiveBadge}
          </span>
        )}
      </div>

      {roomLabel ? (
        <p className="mt-1 text-xs text-ink-muted">{roomLabel}</p>
      ) : null}

      <p className="mt-2 text-sm text-ink-muted">{body}</p>
      <p className="mt-1 text-[11px] text-ink-muted">{E.marketplaceOnlyNote}</p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] text-ink-muted">{E.statusLabel}</dt>
          <dd className="font-semibold text-ink">{statusLabel}</dd>
        </div>
        {coverageLabel && (
          <div>
            <dt className="text-[11px] text-ink-muted">{E.coverageLabel}</dt>
            <dd className="font-semibold text-ink">{coverageLabel}</dd>
          </div>
        )}
        {typeof amountCents === "number" && amountCents > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] text-ink-muted">{E.amountLabel}</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {formatEscrowAmount(amountCents, loc)}
              {!live && (
                <span className="ml-1 text-[11px] font-normal text-ink-muted">
                  ({E.illustrative})
                </span>
              )}
            </dd>
            {(typeof firstMonthCents === "number" && firstMonthCents > 0) ||
            (typeof depositCents === "number" && depositCents > 0) ? (
              <ul className="mt-1 space-y-0.5 text-[11px] font-normal text-ink-muted">
                {typeof firstMonthCents === "number" &&
                  firstMonthCents > 0 &&
                  coverage !== "deposit" && (
                    <li>
                      {E.breakdownFirstMonth}:{" "}
                      {formatEscrowAmount(firstMonthCents, loc)}
                    </li>
                  )}
                {typeof depositCents === "number" &&
                  depositCents > 0 &&
                  coverage !== "first_month" && (
                    <li>
                      {E.breakdownDeposit}: {formatEscrowAmount(depositCents, loc)}
                    </li>
                  )}
              </ul>
            ) : null}
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="rounded-full bg-sea-600/40 px-3 py-1.5 text-xs font-semibold text-white"
          title={E.disabledHint}
        >
          {role === "student" ? E.confirmMoveInStudent : E.confirmMoveInOwner}
        </button>
        <button
          type="button"
          disabled
          className="rounded-full border border-sea-200 px-3 py-1.5 text-xs font-semibold text-ink-muted"
          title={E.disabledHint}
        >
          {E.reportIssue}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-ink-muted">{E.legalHoldNote}</p>
    </section>
  );
}
