// app/api/my-payments/route.ts
//
// Storico pagamenti + mese corrente per lo studente autenticato.
// Service role + check esplicito studentId === user.id.

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { dueDateForPeriod, type RentPaymentStatus, type StudentPaymentSummary } from "@/lib/rent-payments";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId mancante." }, { status: 400 });
  }

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }
  if (user.id !== studentId) {
    return NextResponse.json(
      { error: "Non puoi vedere i dati di un altro utente." },
      { status: 403 },
    );
  }

  const db = createServiceSupabaseClient();

  try {
    const { data: tenancy } = await db
      .from("room_tenancies")
      .select(
        `
        id,
        rooms:room_id ( price_monthly, estimated_utilities )
      `,
      )
      .eq("student_id", studentId)
      .is("ended_at", null)
      .maybeSingle();

    if (!tenancy) {
      return NextResponse.json({ tenancyId: null, payments: [], nextPayment: null, stripeReady: false });
    }

    const room = (tenancy as { rooms?: { price_monthly?: number; estimated_utilities?: number } | null }).rooms;
    const defaultAmount =
      Number(room?.price_monthly ?? 0) + Number(room?.estimated_utilities ?? 0);

    const { data: rows } = await db
      .from("rent_payments")
      .select(
        "id, period_month, amount_due, status, paid_at, payment_method, stripe_invoice_url",
      )
      .eq("tenancy_id", tenancy.id)
      .order("period_month", { ascending: false });

    const periodMonth = currentPeriodMonth();
    const payments = (rows ?? []).map((p) => ({
      id: p.id as string,
      periodMonth: p.period_month as string,
      amountDue: Number(p.amount_due),
      status: p.status as RentPaymentStatus,
      paidAt: (p.paid_at as string | null) ?? null,
      paymentMethod: (p.payment_method as string | null) ?? null,
      invoiceUrl: (p.stripe_invoice_url as string | null) ?? null,
      dueDate: dueDateForPeriod(p.period_month as string),
    }));

    let nextPayment: StudentPaymentSummary | null =
      payments.find((p) => p.periodMonth === periodMonth) ?? null;
    if (!nextPayment) {
      nextPayment = {
        id: null,
        periodMonth,
        amountDue: defaultAmount > 0 ? defaultAmount : Number(room?.price_monthly ?? 0),
        status: "da_registrare",
        paidAt: null,
        paymentMethod: null,
        invoiceUrl: null,
        dueDate: dueDateForPeriod(periodMonth),
      };
    }

    return NextResponse.json({
      tenancyId: tenancy.id,
      payments,
      nextPayment,
      stripeReady: isStripeConfigured(),
    });
  } catch (err) {
    console.error("[api/my-payments] Errore:", err);
    return NextResponse.json(
      { tenancyId: null, payments: [], nextPayment: null, stripeReady: false },
      { status: 500 },
    );
  }
}
