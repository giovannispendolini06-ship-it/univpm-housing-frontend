/**
 * Marketplace escrow — schema/UI predisposed, payments NOT live.
 * Flip only after legal OK + Stripe Connect wiring.
 */
export const ESCROW_LIVE: boolean = false;

export type EscrowStatus = "pending" | "released" | "disputed" | "refunded";

export type EscrowPayment = {
  id: string;
  applicationId: string | null;
  roomId: string;
  studentId: string;
  ownerId: string;
  amountCents: number;
  currency: string;
  status: EscrowStatus;
  studentConfirmedAt: string | null;
  ownerConfirmedAt: string | null;
  createdAt: string;
};

export function isEscrowLive(): boolean {
  return ESCROW_LIVE;
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
