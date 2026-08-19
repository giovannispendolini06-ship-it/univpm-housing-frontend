/**
 * Marketplace escrow — schema/UI predisposed, payments NOT live.
 * Flip only after legal OK + Stripe Connect (or third-party) wiring.
 */
export const ESCROW_LIVE: boolean = false;

export type EscrowStatus = "pending" | "released" | "disputed" | "refunded";

/**
 * Configurable hold scope — do not hard-code product policy in UI.
 * - first_month: only first month rent
 * - deposit: only security deposit
 * - first_month_and_deposit: both
 */
export type EscrowCoverage =
  | "first_month"
  | "deposit"
  | "first_month_and_deposit";

/** Platform default until a property sets its own `escrow_coverage`. */
export const DEFAULT_ESCROW_COVERAGE: EscrowCoverage = "first_month_and_deposit";

const COVERAGE_VALUES: readonly EscrowCoverage[] = [
  "first_month",
  "deposit",
  "first_month_and_deposit",
];

/** Parse form/DB value; empty/invalid → null (platform default). */
export function parseEscrowCoverage(
  raw: FormDataEntryValue | string | null | undefined,
): EscrowCoverage | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  return (COVERAGE_VALUES as readonly string[]).includes(value)
    ? (value as EscrowCoverage)
    : null;
}

export type EscrowPayment = {
  id: string;
  applicationId: string | null;
  roomId: string;
  studentId: string;
  ownerId: string;
  amountCents: number;
  currency: string;
  status: EscrowStatus;
  coverage: EscrowCoverage | null;
  firstMonthCents: number | null;
  depositCents: number | null;
  studentConfirmedAt: string | null;
  ownerConfirmedAt: string | null;
  createdAt: string;
};

export function isEscrowLive(): boolean {
  return ESCROW_LIVE;
}

export function resolveEscrowCoverage(
  propertyCoverage: EscrowCoverage | null | undefined,
): EscrowCoverage {
  return propertyCoverage ?? DEFAULT_ESCROW_COVERAGE;
}

/** Sum components according to coverage (euros → cents). */
export function computeEscrowAmountCents(input: {
  coverage: EscrowCoverage | null | undefined;
  firstMonthEuros?: number | null;
  depositEuros?: number | null;
}): {
  coverage: EscrowCoverage;
  firstMonthCents: number;
  depositCents: number;
  totalCents: number;
} {
  const coverage = resolveEscrowCoverage(input.coverage);
  const firstMonthCents = Math.max(
    0,
    Math.round((Number(input.firstMonthEuros) || 0) * 100),
  );
  const depositCents = Math.max(
    0,
    Math.round((Number(input.depositEuros) || 0) * 100),
  );

  let totalCents = 0;
  if (coverage === "first_month" || coverage === "first_month_and_deposit") {
    totalCents += firstMonthCents;
  }
  if (coverage === "deposit" || coverage === "first_month_and_deposit") {
    totalCents += depositCents;
  }

  return { coverage, firstMonthCents, depositCents, totalCents };
}

export function formatEscrowAmount(
  amountCents: number,
  locale: "it" | "en" = "it",
): string {
  const value = amountCents / 100;
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
