import type { createServiceSupabaseClient } from "@/lib/supabase/server";

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
    "Al momento non abbiamo stanze compatibili con il tuo profilo. Ho salvato le tue preferenze in lista d'attesa: appena arriva un immobile adatto, sarai tra i primi ad essere avvisato.";
  if (!hasPhone) {
    msg +=
      " Se vuoi, lasciami il tuo numero WhatsApp o di telefono così possiamo contattarti più velocemente.";
  }
  return msg;
}

/**
 * Upsert waitlist_signups from a logged-in student's profile (Vesta fallback).
 * Uses user_id unique index — updates existing row if present.
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
  };

  const { error: upsertError } = await db
    .from("waitlist_signups")
    .upsert(payload, { onConflict: "user_id" });

  if (upsertError) {
    console.error("[waitlist] Errore upsert waitlist_signups:", upsertError);
  }
}
