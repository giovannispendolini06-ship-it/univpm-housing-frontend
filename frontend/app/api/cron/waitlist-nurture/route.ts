import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { processDueWaitlistNurture } from "@/lib/waitlist-nurture";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    // In produzione richiediamo CRON_SECRET; in assenza rifiutiamo.
    console.warn("[cron/waitlist-nurture] CRON_SECRET non impostata");
    return false;
  }
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

/**
 * Cron giornaliero: invia email nurture waitlist in scadenza.
 * Vercel Cron invia Authorization: Bearer $CRON_SECRET se CRON_SECRET è in env.
 */
async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceSupabaseClient();
  const result = await processDueWaitlistNurture(db);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
