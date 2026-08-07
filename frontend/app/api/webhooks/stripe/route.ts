// app/api/webhooks/stripe/route.ts
//
// Predisposto per aggiornare rent_payments da eventi Stripe.
// Se STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET non sono configurati,
// risponde 503 senza crashare (endpoint "inattivo").

import { NextRequest, NextResponse } from "next/server";
import {
  getStripe,
  getStripeWebhookSecret,
  isStripeConfigured,
  isStripeWebhookConfigured,
  RENT_PAYMENT_STATUS,
} from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook Stripe non attivo: configura STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false, message: "Stripe non disponibile." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] Firma non valida:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = createServiceSupabaseClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: Record<string, string>;
          payment_intent?: string | null;
          customer?: string | null;
          payment_method_types?: string[];
          invoice?: string | null;
          amount_total?: number | null;
        };
        const paymentId = session.metadata?.rent_payment_id;
        if (!paymentId) break;

        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;
        const method = session.payment_method_types?.[0] ?? null;

        let invoiceUrl: string | null = null;
        if (session.invoice && typeof session.invoice === "string") {
          try {
            const invoice = await stripe.invoices.retrieve(session.invoice);
            invoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null;
          } catch {
            invoiceUrl = null;
          }
        }

        // Se non c'è fattura, prova a recuperare la receipt dal PaymentIntent charge
        if (!invoiceUrl && paymentIntentId) {
          try {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
              expand: ["latest_charge"],
            });
            const charge = pi.latest_charge;
            if (charge && typeof charge !== "string") {
              invoiceUrl = charge.receipt_url ?? null;
            }
          } catch {
            /* ignore */
          }
        }

        await db
          .from("rent_payments")
          .update({
            status: RENT_PAYMENT_STATUS.paid,
            paid_at: new Date().toISOString().slice(0, 10),
            stripe_payment_intent_id: paymentIntentId,
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            payment_method: method,
            stripe_invoice_url: invoiceUrl,
          })
          .eq("id", paymentId);
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          metadata?: Record<string, string>;
          customer?: string | null;
          payment_method_types?: string[];
        };
        const paymentId = pi.metadata?.rent_payment_id;
        const query = db
          .from("rent_payments")
          .update({
            status: RENT_PAYMENT_STATUS.paid,
            paid_at: new Date().toISOString().slice(0, 10),
            stripe_payment_intent_id: pi.id,
            stripe_customer_id: typeof pi.customer === "string" ? pi.customer : null,
            payment_method: pi.payment_method_types?.[0] ?? null,
          });
        if (paymentId) await query.eq("id", paymentId);
        else await query.eq("stripe_payment_intent_id", pi.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as {
          id: string;
          metadata?: Record<string, string>;
        };
        const paymentId = pi.metadata?.rent_payment_id;
        const query = db
          .from("rent_payments")
          .update({
            status: RENT_PAYMENT_STATUS.failed,
            stripe_payment_intent_id: pi.id,
          });
        if (paymentId) await query.eq("id", paymentId);
        else await query.eq("stripe_payment_intent_id", pi.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as {
          id: string;
          hosted_invoice_url?: string | null;
          invoice_pdf?: string | null;
          payment_intent?: string | null;
          metadata?: Record<string, string>;
        };
        const url = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null;
        const paymentId = invoice.metadata?.rent_payment_id;
        const piId =
          typeof invoice.payment_intent === "string" ? invoice.payment_intent : null;

        if (paymentId) {
          await db
            .from("rent_payments")
            .update({
              status: RENT_PAYMENT_STATUS.paid,
              paid_at: new Date().toISOString().slice(0, 10),
              stripe_invoice_url: url,
              stripe_payment_intent_id: piId,
            })
            .eq("id", paymentId);
        } else if (piId) {
          await db
            .from("rent_payments")
            .update({
              status: RENT_PAYMENT_STATUS.paid,
              paid_at: new Date().toISOString().slice(0, 10),
              stripe_invoice_url: url,
            })
            .eq("stripe_payment_intent_id", piId);
        }
        break;
      }

      default:
        // Eventi non gestiti: ack senza errori
        break;
    }
  } catch (err) {
    console.error("[webhooks/stripe] Errore elaborazione:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
