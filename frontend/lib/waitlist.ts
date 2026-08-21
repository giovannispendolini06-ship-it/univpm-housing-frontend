import type { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, buildAdminWaitlistEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { scheduleWaitlistNurture } from "@/lib/waitlist-nurture";
import {
  createReferralCode,
  ensureReferralCode,
} from "@/lib/waitlist-referral";

export interface StudentProfileForWaitlist {
  degree_course?: string | null;
  polo_univpm?: string | null;
  city_slug?: string | null;
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
  position?: number | null,
): string {
  const positionBit =
    position && position > 0
      ? locale === "en"
        ? ` You're #${position} on the waitlist.`
        : ` Sei il ${position}° in lista d'attesa.`
      : "";

  if (locale === "en") {
    let msg =
      "We don't have any compatible rooms for your profile right now. I've saved your preferences to the waitlist — you'll be among the first to know when a suitable place becomes available.";
    msg += positionBit;
    if (!hasPhone) {
      msg +=
        " If you'd like, share your WhatsApp or phone number so we can reach you faster.";
    }
    return msg;
  }

  let msg =
    "Al momento non ho ancora stanze che corrispondono al tuo profilo, ma ho salvato le tue preferenze. Appena carico un immobile compatibile con te e il tuo budget, sarai tra i primi ad essere avvisato.";
  msg += positionBit;
  if (!hasPhone) {
    msg +=
      " Se vuoi, lasciami il tuo numero WhatsApp così possiamo raggiungerti più velocemente.";
  }
  return msg;
}

/** Posizione 1-based per created_at (pareggi: id lessicografico). */
export async function computeWaitlistPosition(
  db: ServiceClient,
  signup: { id: string; created_at: string },
): Promise<number> {
  const { count: earlier, error: err1 } = await db
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true })
    .lt("created_at", signup.created_at);

  if (err1) {
    console.error("[waitlist] position earlier count:", err1);
    return 0;
  }

  const { count: sameTimeBefore, error: err2 } = await db
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true })
    .eq("created_at", signup.created_at)
    .lt("id", signup.id);

  if (err2) {
    console.error("[waitlist] position tiebreak count:", err2);
    return (earlier ?? 0) + 1;
  }

  return (earlier ?? 0) + (sameTimeBefore ?? 0) + 1;
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
  | { status: "confirmed"; position: number | null; referralCode: string | null }
  | { status: "already"; position: number | null; referralCode: string | null }
  | { status: "expired" }
  | { status: "invalid" };

/**
 * Conferma un'iscrizione waitlist tramite token email (service role).
 * Idempotente se già confermata. Restituisce la posizione reale in lista.
 */
export async function confirmWaitlistByToken(
  db: ServiceClient,
  token: string,
): Promise<ConfirmWaitlistResult> {
  const cleaned = token.trim();
  if (!cleaned || cleaned.length < 16) return { status: "invalid" };

  const { data: row, error } = await db
    .from("waitlist_signups")
    .select("id, created_at, confirmed_at, confirmation_expires_at, email, referral_code")
    .eq("confirmation_token", cleaned)
    .maybeSingle();

  if (error) {
    console.error("[waitlist] confirm lookup error:", error);
    return { status: "invalid" };
  }
  if (!row) return { status: "invalid" };

  if (row.confirmed_at) {
    const position = await computeWaitlistPosition(db, {
      id: row.id,
      created_at: row.created_at,
    });
    const referralCode = await ensureReferralCode(db, row.id, row.referral_code);
    return { status: "already", position: position || null, referralCode };
  }

  const expiresAt = row.confirmation_expires_at
    ? new Date(row.confirmation_expires_at).getTime()
    : 0;
  if (!expiresAt || Date.now() > expiresAt) {
    return { status: "expired" };
  }

  // Teniamo il token: rieseguire il link mostra "già confermata" + posizione.
  const confirmedAt = new Date().toISOString();
  const { error: updateError } = await db
    .from("waitlist_signups")
    .update({
      confirmed_at: confirmedAt,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("[waitlist] confirm update error:", updateError);
    return { status: "invalid" };
  }

  await scheduleWaitlistNurture(db, row.id, {
    confirmedAt,
    email: row.email,
  });

  const referralCode = await ensureReferralCode(db, row.id, row.referral_code);

  const position = await computeWaitlistPosition(db, {
    id: row.id,
    created_at: row.created_at,
  });
  return { status: "confirmed", position: position || null, referralCode };
}

/**
 * Upsert waitlist_signups from a logged-in student's profile (Vesta fallback).
 * Uses user_id unique index — updates existing row if present.
 * Account già autenticato → confirmed_at immediato (niente DOI email).
 * @returns posizione in lista (null se fallisce / nessun contatto)
 */
export async function upsertWaitlistFromStudentProfile(
  db: ServiceClient,
  userId: string,
  profile: StudentProfileForWaitlist,
  source: string,
): Promise<number | null> {
  const { data: userRow, error: userError } = await db
    .from("users")
    .select("full_name, email, phone, preferred_locale")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("[waitlist] Errore lettura users:", userError);
    return null;
  }

  const nome = userRow?.full_name?.trim() || "Studente";
  const email = userRow?.email?.trim() || null;
  const phone = userRow?.phone?.trim() || null;
  const preferredLocale = userRow?.preferred_locale === "en" ? "en" : "it";

  if (!email && !phone) {
    console.warn("[waitlist] Nessun contatto per user", userId);
    return null;
  }

  const nowIso = new Date().toISOString();
  const payload = {
    user_id: userId,
    nome,
    email,
    phone,
    facolta: profile.degree_course ?? null,
    polo: profile.polo_univpm ?? null,
    city_slug: profile.city_slug ?? null,
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
    preferred_locale: preferredLocale,
  };

  // Indice unique parziale su user_id: ON CONFLICT (user_id) non è
  // affidabile via PostgREST — select + update/insert è più sicuro.
  const { data: existing } = await db
    .from("waitlist_signups")
    .select("id, created_at, referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  let signupId = existing?.id as string | undefined;
  let createdAt = existing?.created_at as string | undefined;
  let isNew = false;

  if (existing?.id) {
    const { error: writeError } = await db
      .from("waitlist_signups")
      .update(payload)
      .eq("id", existing.id);
    if (writeError) {
      console.error("[waitlist] Errore salvataggio waitlist_signups:", writeError);
      return null;
    }
    await ensureReferralCode(db, existing.id, existing.referral_code);
  } else {
    const { data: inserted, error: writeError } = await db
      .from("waitlist_signups")
      .insert({ ...payload, referral_code: createReferralCode() })
      .select("id, created_at")
      .single();
    if (writeError || !inserted) {
      console.error("[waitlist] Errore salvataggio waitlist_signups:", writeError);
      return null;
    }
    signupId = inserted.id;
    createdAt = inserted.created_at;
    isNew = true;

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

  if (!signupId || !createdAt) return null;

  // Prima iscrizione Vesta con email → programma nurture (idempotente).
  if (isNew && email) {
    await scheduleWaitlistNurture(db, signupId, {
      confirmedAt: nowIso,
      email,
    });
  }

  const position = await computeWaitlistPosition(db, {
    id: signupId,
    created_at: createdAt,
  });
  return position || null;
}
