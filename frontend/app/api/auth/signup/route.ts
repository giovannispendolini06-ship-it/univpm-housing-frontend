import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const MAX_SIGNUPS_PER_HOUR = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupBody = {
  email?: unknown;
  password?: unknown;
  fullName?: unknown;
  role?: unknown;
  consentGiven?: unknown;
};

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Registrazione che NON usa lo SMTP di Supabase Auth (spesso in errore:
 * "Error sending confirmation email"). Crea l'utente già confermato via
 * service role; il client fa poi signInWithPassword.
 */
export async function POST(req: NextRequest) {
  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const fullName = String(body.fullName ?? "").trim();
  const role = body.role === "owner" ? "owner" : body.role === "student" ? "student" : null;
  const consentGiven = body.consentGiven === true;

  if (!fullName) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "password_short" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "role_invalid" }, { status: 400 });
  }
  if (!consentGiven) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const ip = clientIp(req);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("form_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("form_name", "auth_signup")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= MAX_SIGNUPS_PER_HOUR) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  await supabase.from("form_rate_limits").insert({
    ip_address: ip,
    form_name: "auth_signup",
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (
      msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      error.status === 422
    ) {
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }
    console.error("[auth/signup] createUser failed:", error.message);
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
