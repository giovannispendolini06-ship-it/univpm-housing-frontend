// app/api/payments/checkout/route.ts
//
// Avvia Stripe Checkout (hosted) per il canone del mese corrente.
// Se Stripe non è configurato → 503 con messaggio chiaro (niente errori criptici).

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "I pagamenti online saranno attivi a breve — nel frattempo contattaci per le modalità di pagamento.",
        code: "STRIPE_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe non disponibile.", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  let body: { tenancyId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const db = createServiceSupabaseClient();
  const periodMonth = currentPeriodMonth();

  const { data: tenancy } = await db
    .from("room_tenancies")
    .select(
      `
      id, student_id,
      rooms:room_id ( room_label, price_monthly, estimated_utilities ),
      users:student_id ( email, full_name )
    `,
    )
    .eq("student_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (!tenancy || (body.tenancyId && tenancy.id !== body.tenancyId)) {
    return NextResponse.json({ error: "Nessun affitto attivo." }, { status: 404 });
  }

  const room = (tenancy as any).rooms;
  const student = (tenancy as any).users;
  const amount =
    Number(room?.price_monthly ?? 0) + Number(room?.estimated_utilities ?? 0);

  if (!(amount > 0)) {
    return NextResponse.json(
      { error: "Importo non valido per questo affitto." },
      { status: 400 },
    );
  }

  // Assicura una riga rent_payments per il mese corrente
  const { data: existing } = await db
    .from("rent_payments")
    .select("id, status, stripe_customer_id")
    .eq("tenancy_id", tenancy.id)
    .eq("period_month", periodMonth)
    .maybeSingle();

  if (existing?.status === "pagato") {
    return NextResponse.json(
      { error: "Questo mese risulta già pagato." },
      { status: 400 },
    );
  }

  let paymentId = existing?.id as string | undefined;
  if (!paymentId) {
    const { data: inserted, error } = await db
      .from("rent_payments")
      .insert({
        tenancy_id: tenancy.id,
        period_month: periodMonth,
        amount_due: amount,
        status: "da_registrare",
      })
      .select("id")
      .single();
    if (error || !inserted) {
      return NextResponse.json(
        { error: error?.message ?? "Impossibile creare il pagamento." },
        { status: 500 },
      );
    }
    paymentId = inserted.id as string;
  } else {
    await db
      .from("rent_payments")
      .update({ amount_due: amount })
      .eq("id", paymentId);
  }

  const amountCents = Math.round(amount * 100);
  const label = room?.room_label
    ? `Affitto ${room.room_label} — ${periodMonth.slice(0, 7)}`
    : `Affitto Coabito — ${periodMonth.slice(0, 7)}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: student?.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: label,
              description: "Canone mensile Coabito",
            },
          },
        },
      ],
      payment_method_types: ["card", "sepa_debit"],
      metadata: {
        rent_payment_id: paymentId,
        tenancy_id: String(tenancy.id),
        student_id: user.id,
        period_month: periodMonth,
      },
      success_url: `${SITE_URL}/dashboard?payment=success`,
      cancel_url: `${SITE_URL}/dashboard?payment=cancelled`,
    });

    if (session.payment_intent && typeof session.payment_intent === "string") {
      await db
        .from("rent_payments")
        .update({ stripe_payment_intent_id: session.payment_intent })
        .eq("id", paymentId);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/payments/checkout]", err);
    return NextResponse.json(
      { error: "Impossibile avviare Stripe Checkout. Riprova più tardi." },
      { status: 500 },
    );
  }
}
