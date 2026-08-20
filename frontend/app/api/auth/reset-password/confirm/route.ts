import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const MIN_PASSWORD = 6;

/**
 * Completa il reset: verifyOtp(recovery) + updateUser({ password }).
 * Body: { token_hash, newPassword }
 */
export async function POST(req: NextRequest) {
  let body: { token_hash?: unknown; newPassword?: unknown; type?: unknown };
  try {
    body = (await req.json()) as {
      token_hash?: unknown;
      newPassword?: unknown;
      type?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const tokenHash = String(body.token_hash ?? "").trim();
  const newPassword = String(body.newPassword ?? "");
  const type = body.type === "recovery" || !body.type ? "recovery" : String(body.type);

  if (!tokenHash) {
    return NextResponse.json({ error: "token_required" }, { status: 400 });
  }
  if (newPassword.length < MIN_PASSWORD) {
    return NextResponse.json({ error: "password_short" }, { status: 400 });
  }
  if (type !== "recovery") {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  let response = NextResponse.json({ ok: true });
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof response.cookies.set>[2];
        }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: tokenHash,
  });

  if (verifyError) {
    console.warn("[auth/reset-password/confirm] verifyOtp:", verifyError.message);
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 400 });
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("[auth/reset-password/confirm] updateUser:", updateError.message);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return response;
}
