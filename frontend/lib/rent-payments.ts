// Tipi condivisi per rent_payments (studente + admin + webhook).

export type RentPaymentStatus =
  | "da_registrare"
  | "pagato"
  | "in_ritardo"
  | "fallito";

export interface RentPaymentRow {
  id: string;
  tenancy_id: string;
  period_month: string;
  amount_due: number;
  status: RentPaymentStatus;
  paid_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_url: string | null;
  payment_method: string | null;
}

export interface StudentPaymentSummary {
  id: string | null;
  periodMonth: string;
  amountDue: number;
  status: RentPaymentStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  invoiceUrl: string | null;
  /** Scadenza convenzionale: fine del mese di period_month (ISO date). */
  dueDate: string;
}

export function dueDateForPeriod(periodMonth: string): string {
  // period_month è YYYY-MM-01 → ultimo giorno del mese
  const [y, m] = periodMonth.split("-").map(Number);
  const last = new Date(y, m, 0);
  return last.toISOString().slice(0, 10);
}

export function labelForPaymentMethod(method: string | null | undefined): string {
  if (!method) return "—";
  const map: Record<string, string> = {
    card: "Carta",
    sepa_debit: "SEPA",
    paypal: "PayPal",
    link: "Link",
  };
  return map[method] ?? method;
}
