// POST /api/owner/partner-tier
//
// Owners cannot self-assign Partner / Fondatrice. Tier is computed from
// closed_leases (Partner) or set by admin (Fondatrice). Always rejects writes.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  let body: { partner_tier?: string; founding_rate?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Even if the client tries to patch users.partner_tier, RLS + privileged
  // column trigger block it. This route refuses explicitly for the test case.
  return NextResponse.json(
    {
      error:
        "Il livello partner non può essere impostato dall'account. Diventa Partner automaticamente con 3 contratti chiusi in 12 mesi; Fondatrice è assegnata solo da admin.",
      requested: body.partner_tier ?? null,
      founding_rate: body.founding_rate ?? null,
    },
    { status: 403 },
  );
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
