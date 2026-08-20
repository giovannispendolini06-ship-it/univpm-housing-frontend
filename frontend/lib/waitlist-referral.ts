import { SITE_URL } from "@/lib/site";
import type { createServiceSupabaseClient } from "@/lib/supabase/server";

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

/** Codice referral corto (10 hex chars). */
export function createReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export function waitlistReferralUrl(code: string): string {
  return `${SITE_URL}/lista-attesa?ref=${encodeURIComponent(code)}`;
}

/**
 * Risolve ?ref=CODE → id dell'invitante (null se assente/invalido).
 */
export async function resolveReferrerId(
  db: ServiceClient,
  rawRef: string | null | undefined,
): Promise<string | null> {
  const code = rawRef?.trim();
  if (!code || code.length < 6 || code.length > 32) return null;

  const { data, error } = await db
    .from("waitlist_signups")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();

  if (error) {
    console.error("[waitlist-referral] resolve:", error);
    return null;
  }
  return data?.id ?? null;
}

/** Assicura un referral_code sulla riga (idempotente). */
export async function ensureReferralCode(
  db: ServiceClient,
  signupId: string,
  existingCode?: string | null,
): Promise<string | null> {
  if (existingCode?.trim()) return existingCode.trim();

  for (let attempt = 0; attempt < 4; attempt++) {
    const code = createReferralCode();
    const { error } = await db
      .from("waitlist_signups")
      .update({ referral_code: code })
      .eq("id", signupId)
      .is("referral_code", null);

    if (!error) {
      const { data } = await db
        .from("waitlist_signups")
        .select("referral_code")
        .eq("id", signupId)
        .maybeSingle();
      return data?.referral_code ?? code;
    }
  }

  console.error("[waitlist-referral] ensureReferralCode failed for", signupId);
  return null;
}
