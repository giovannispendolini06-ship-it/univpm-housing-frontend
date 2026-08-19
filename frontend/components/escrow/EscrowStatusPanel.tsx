"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import { formatEscrowAmount, isEscrowLive, type EscrowStatus } from "@/lib/escrow";

type Role = "student" | "owner";

/**
 * Escrow panel — always shows inactive banner while ESCROW_LIVE is false.
 * Confirm buttons stay disabled; no Stripe calls.
 */
export default function EscrowStatusPanel({
  role,
  status = "pending",
  amountCents,
  roomLabel,
}: {
  role: Role;
  status?: EscrowStatus;
  /** Optional illustrative amount (e.g. first month); not charged */
  amountCents?: number | null;
  roomLabel?: string | null;
}) {
  const { t, locale } = useLocale();
  const live = isEscrowLive();
  const E = t.escrow;

  const statusLabel =
    status === "released"
      ? E.statusReleased
      : status === "disputed"
        ? E.statusDisputed
        : status === "refunded"
          ? E.statusRefunded
          : E.statusPending;

  const body =
    role === "student" ? E.studentPendingCopy : E.ownerPendingCopy;

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

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] text-ink-muted">{E.statusLabel}</dt>
          <dd className="font-semibold text-ink">{statusLabel}</dd>
        </div>
        {typeof amountCents === "number" && amountCents > 0 && (
          <div>
            <dt className="text-[11px] text-ink-muted">{E.amountLabel}</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {formatEscrowAmount(amountCents, locale === "en" ? "en" : "it")}
              {!live && (
                <span className="ml-1 text-[11px] font-normal text-ink-muted">
                  ({E.illustrative})
                </span>
              )}
            </dd>
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
