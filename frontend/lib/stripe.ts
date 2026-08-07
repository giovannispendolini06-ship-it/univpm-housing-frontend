// lib/stripe.ts
//
// Predisposizione Stripe: le chiavi restano placeholder finché la società
// non è costituita. Nessun checkout reale parte se SECRET/PUBLISHABLE
// mancano o sono valori fittizi tipo "test_pending".

import Stripe from "stripe";

const PLACEHOLDER_VALUES = new Set([
  "",
  "test_pending",
  "sk_test_pending",
  "pk_test_pending",
  "whsec_pending",
]);

function envOrEmpty(name: string): string {
  return (process.env[name] ?? "").trim();
}

function isUsableSecret(value: string): boolean {
  if (!value || PLACEHOLDER_VALUES.has(value)) return false;
  return value.startsWith("sk_test_") || value.startsWith("sk_live_");
}

function isUsablePublishable(value: string): boolean {
  if (!value || PLACEHOLDER_VALUES.has(value)) return false;
  return value.startsWith("pk_test_") || value.startsWith("pk_live_");
}

/** True solo se secret + publishable sono chiavi Stripe vere (anche test). */
export function isStripeConfigured(): boolean {
  return (
    isUsableSecret(envOrEmpty("STRIPE_SECRET_KEY")) &&
    isUsablePublishable(
      envOrEmpty("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ||
        envOrEmpty("STRIPE_PUBLISHABLE_KEY"),
    )
  );
}

export function isStripeWebhookConfigured(): boolean {
  const secret = envOrEmpty("STRIPE_WEBHOOK_SECRET");
  if (!secret || PLACEHOLDER_VALUES.has(secret)) return false;
  return secret.startsWith("whsec_");
}

export function getStripePublishableKey(): string | null {
  const key =
    envOrEmpty("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ||
    envOrEmpty("STRIPE_PUBLISHABLE_KEY");
  return isUsablePublishable(key) ? key : null;
}

let stripeClient: Stripe | null = null;

/** Restituisce il client Stripe o null se non configurato. */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(envOrEmpty("STRIPE_SECRET_KEY"));
  }
  return stripeClient;
}

export function getStripeWebhookSecret(): string | null {
  return isStripeWebhookConfigured() ? envOrEmpty("STRIPE_WEBHOOK_SECRET") : null;
}

/** Stati DB (italiani, già in produzione) ↔ concetti Stripe. */
export type RentPaymentStatus =
  | "da_registrare"
  | "pagato"
  | "in_ritardo"
  | "fallito";

export const RENT_PAYMENT_STATUS = {
  pending: "da_registrare",
  paid: "pagato",
  overdue: "in_ritardo",
  failed: "fallito",
} as const satisfies Record<string, RentPaymentStatus>;
