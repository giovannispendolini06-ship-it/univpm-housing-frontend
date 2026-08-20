import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

/**
 * Opt-out email da link nelle email CRM.
 * GET /api/unsubscribe?token=PARTNER_TOKEN&channel=email
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim();
  const channel = url.searchParams.get("channel") || "email";

  if (!token) {
    return new NextResponse("Link non valido.", { status: 400 });
  }

  const db = createServiceSupabaseClient();
  const { data: tok } = await db
    .from("crm_partner_tokens")
    .select("contact_id")
    .eq("token", token)
    .maybeSingle();

  if (!tok?.contact_id) {
    return new NextResponse("Link non valido o scaduto.", { status: 404 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (channel === "whatsapp") {
    patch.whatsapp_opt_out = true;
  } else {
    patch.email_opt_out = true;
  }

  await db.from("crm_contacts").update(patch).eq("id", tok.contact_id);

  await db
    .from("crm_sequence_enrollments")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
      stop_reason: "unsubscribe",
    })
    .eq("contact_id", tok.contact_id)
    .eq("status", "active");

  await db.from("crm_timeline_events").insert({
    contact_id: tok.contact_id,
    event_type: channel === "whatsapp" ? "WHATSAPP_OPT_OUT" : "EMAIL_OPT_OUT",
    source: "unsubscribe_link",
  });

  const html = `<!doctype html><html lang="it"><body style="font-family:system-ui;padding:40px;background:#F4F8F7;color:#0F2A2E">
  <h1 style="font-size:22px">Disiscrizione confermata</h1>
  <p>Non riceverai più comunicazioni commerciali Coabito su questo canale.</p>
  <p><a href="https://coabito.it" style="color:#0F6E6A">Torna a Coabito</a></p>
  </body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
