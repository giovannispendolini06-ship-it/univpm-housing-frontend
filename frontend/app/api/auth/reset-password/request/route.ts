import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/auth-emails";
import { SITE_URL } from "@/lib/site";

const MAX_RESETS_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Richiesta reset password — zero SMTP Auth Supabase.
 * admin.generateLink({ type: 'recovery' }) crea il token SENZA inviare email;
 * l'invio è solo via Resend (sendPasswordResetEmail).
 * Risposta sempre generica (anti user-enumeration).
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

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  // generateLink must NOT trigger Supabase's native mailer. If Auth logs
  // ever show an outbound SMTP attempt on this path, investigate immediately.
  if (error) {
    // Typically "User not found" — still return generic ok
    console.warn("[auth/reset-password/request] generateLink:", error.message);
    return NextResponse.json({ ok: true });
  }

  const hashedToken = data?.properties?.hashed_token;
  if (!hashedToken) {
    console.warn(
      "[auth/reset-password/request] missing hashed_token; refusing to fall back to action_link that may hit Auth verify/SMTP",
    );
    return NextResponse.json({ ok: true });
  }

  // App-owned URL: confirm endpoint verifies token_hash (no native Auth email)
  const resetUrl = `${SITE_URL}/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`;

  const sendResult = await sendPasswordResetEmail(email, resetUrl);
  if (!sendResult.ok) {
    console.error("[auth/reset-password/request] Resend failed:", sendResult.error);
    // Still generic ok — do not leak delivery status
  }

  return NextResponse.json({ ok: true });
}
