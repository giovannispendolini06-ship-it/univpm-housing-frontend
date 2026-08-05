// app/api/my-tenancy/route.ts
//
// Restituisce, per lo studente autenticato, i dati del suo affitto attivo
// (se esiste): stanza, immobile, affitto, spese stimate, e lo stato del
// pagamento del mese corrente. Usa il service client lato server (bypassa
// RLS), ma verifica esplicitamente che chi chiede i dati sia lo stesso
// studente — stesso schema di sicurezza già usato in /api/matches.

import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        id, started_at,
        rooms:room_id (
          room_label, price_monthly, estimated_utilities,
          properties:property_id ( address, zone )
        )
      `,
      )
      .eq("student_id", studentId)
      .is("ended_at", null)
      .maybeSingle();

    if (!tenancy) {
      return NextResponse.json({ tenancy: null });
    }

    const now = new Date();
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: payment } = await db
      .from("rent_payments")
      .select("status")
      .eq("tenancy_id", tenancy.id)
      .eq("period_month", periodMonth)
      .maybeSingle();

    const room = (tenancy as any).rooms;
    const property = room?.properties;

    return NextResponse.json({
      tenancy: {
        startedAt: tenancy.started_at,
        roomLabel: room?.room_label ?? "",
        priceMonthly: room?.price_monthly ?? 0,
        estimatedUtilities: room?.estimated_utilities ?? 0,
        address: property?.address ?? "",
        zone: property?.zone ?? null,
        paymentStatus: payment?.status ?? "da_registrare",
      },
    });
  } catch (err) {
    console.error("[api/my-tenancy] Errore:", err);
    return NextResponse.json({ tenancy: null });
  }
}
