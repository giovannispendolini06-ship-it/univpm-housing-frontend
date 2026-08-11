import type { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, buildAdminWaitlistEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export interface StudentProfileForWaitlist {
  degree_course?: string | null;
  polo_univpm?: string | null;
  budget_max?: number | null;
  study_habit?: string | null;
  sociability_level?: number | null;
  guests_frequency?: string | null;
  cleanliness_level?: number | null;
}

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

const WAITLIST_KEYWORDS = [
  "lista d'attesa",
  "lista d’attesa",
  "waitlist",
  "lista attesa",
];

/** Token validità conferma email (7 giorni). Scadenza = token non più valido, riga non cancellata. */
export const WAITLIST_CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function replyContainsWaitlistNotice(text: string): boolean {
  const lower = text.toLowerCase();
  return WAITLIST_KEYWORDS.some((kw) => lower.includes(kw));
}

export function buildWaitlistChatFallback(
  locale: "it" | "en",
  hasPhone: boolean,
): string {
  if (locale === "en") {
    let msg =
      "We don't have any compatible rooms for your profile right now. I've saved your preferences to the waitlist — you'll be among the first to know when a suitable place becomes available.";
    if (!hasPhone) {
      msg +=
        " If you'd like, share your WhatsApp or phone number so we can reach you faster.";
    }
    return msg;
  }

  let msg =
    "Al momento non ho ancora stanze che corrispondono al tuo profilo, ma ho salvato le tue preferenze. Appena carico un immobile compatibile con te e il tuo budget, sarai tra i primi ad essere avvisato.";
  if (!hasPhone) {
    msg +=
      " Se vuoi, lasciami il tuo numero WhatsApp così possiamo raggiungerti più velocemente.";
  }
  return msg;
}

/** Marketing / avvisi stanza: solo iscritti con confirmed_at valorizzato. */
export function isWaitlistConfirmed(row: { confirmed_at: string | null }): boolean {
  return row.confirmed_at != null;
}

export function createWaitlistConfirmationToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function waitlistConfirmUrl(token: string): string {
  return `${SITE_URL}/lista-attesa/conferma?token=${encodeURIComponent(token)}`;
}

export type ConfirmWaitlistResult =
  | { status: "confirmed" }
  | { status: "already" }
  | { status: "expired" }
  | { status: "invalid" };

/**
 * Conferma un'iscrizione waitlist tramite token email (service role).
 * Idempotente se già confermata.
 */
export async function confirmWaitlistByToken(
  db: ServiceClient,
  token: string,
): Promise<ConfirmWaitlistResult> {
  const cleaned = token.trim();
  if (!cleaned || cleaned.length < 16) return { status: "invalid" };

  const { data: row, error } = await db
    .from("waitlist_signups")
    .select("id, confirmed_at, confirmation_expires_at")
    .eq("confirmation_token", cleaned)
    .maybeSingle();

  if (error) {
    console.error("[waitlist] confirm lookup error:", error);
    return { status: "invalid" };
  }
  if (!row) return { status: "invalid" };
  if (row.confirmed_at) return { status: "already" };

  const expiresAt = row.confirmation_expires_at
    ? new Date(row.confirmation_expires_at).getTime()
    : 0;
  if (!expiresAt || Date.now() > expiresAt) {
    return { status: "expired" };
  }

  const { error: updateError } = await db
    .from("waitlist_signups")
    .update({
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("[waitlist] confirm update error:", updateError);
    return { status: "invalid" };
  }

  return { status: "confirmed" };
}

/**
 * Upsert waitlist_signups from a logged-in student's profile (Vesta fallback).
 * Uses user_id unique index — updates existing row if present.
 * Account già autenticato → confirmed_at immediato (niente DOI email).
 */
export async function upsertWaitlistFromStudentProfile(
  db: ServiceClient,
  userId: string,
  profile: StudentProfileForWaitlist,
  source: string,
): Promise<void> {
  const { data: userRow, error: userError } = await db
    .from("users")
    .select("full_name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("[waitlist] Errore lettura users:", userError);
    return;
  }

  const nome = userRow?.full_name?.trim() || "Studente";
  const email = userRow?.email?.trim() || null;
  const phone = userRow?.phone?.trim() || null;

  if (!email && !phone) {
    console.warn("[waitlist] Nessun contatto per user", userId);
    return;
  }

  const nowIso = new Date().toISOString();
  const payload = {
    user_id: userId,
    nome,
    email,
    phone,
    facolta: profile.degree_course ?? null,
    polo: profile.polo_univpm ?? null,
    budget: profile.budget_max ?? null,
    study_habit: profile.study_habit ?? null,
    sociability_level: profile.sociability_level ?? null,
    guests_frequency: profile.guests_frequency ?? null,
    cleanliness_level: profile.cleanliness_level ?? null,
    source,
    confirmed_at: nowIso,
    confirmation_token: null,
    confirmation_sent_at: null,
    confirmation_expires_at: null,
  };

  // Indice unique parziale su user_id: ON CONFLICT (user_id) non è
  // affidabile via PostgREST — select + update/insert è più sicuro.
  const { data: existing } = await db
    .from("waitlist_signups")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const { error: writeError } = existing?.id
    ? await db.from("waitlist_signups").update(payload).eq("id", existing.id)
    : await db.from("waitlist_signups").insert(payload);

  if (writeError) {
    console.error("[waitlist] Errore salvataggio waitlist_signups:", writeError);
    return;
  }

  // Notifica admin solo alla prima iscrizione (non a ogni aggiornamento profilo).
  if (!existing?.id) {
    const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL || "info@coabito.it";
    const adminEmail = buildAdminWaitlistEmail({
      nome,
      email,
      phone,
      facolta: payload.facolta,
      polo: payload.polo,
      budget: payload.budget,
      source,
      pendingConfirmation: false,
    });
    sendEmail({ to: adminTo, ...adminEmail });
  }
}
