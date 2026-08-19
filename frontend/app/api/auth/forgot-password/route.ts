import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const MAX_RESETS_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reset password senza SMTP Supabase Auth.
 * Usa admin.generateLink + invio del link via Resend (stesso canale
 * delle email waitlist/benvenuto, già funzionante).
 * Risposta sempre generica (non rivelare se l'email esiste).
 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();

  // Always ok to the client — avoid email enumeration
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceSupabaseClient();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("form_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("form_name", "auth_forgot")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= MAX_RESETS_PER_HOUR) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("form_rate_limits").insert({
    ip_address: ip,
    form_name: "auth_forgot",
  });

  const redirectTo = `${SITE_URL}/reset-password`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    // User may not exist — still return ok
    if (error) {
      console.warn("[auth/forgot-password] generateLink:", error.message);
    }
    return NextResponse.json({ ok: true });
  }

  const resetEmail = buildPasswordResetEmail({
    resetUrl: data.properties.action_link,
  });
  await sendEmail({ to: email, ...resetEmail });

  return NextResponse.json({ ok: true });
}
