import type { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  sendEmail,
  buildWaitlistNurtureMatchingEmail,
  buildWaitlistNurtureLaunchEmail,
} from "@/lib/email";

type ServiceClient = ReturnType<typeof createServiceSupabaseClient>;

/** Giorni dopo confirmed_at per la 1ª nurture (default 3). */
export function nurtureDelayDays1(): number {
  const raw = Number(process.env.WAITLIST_NURTURE_DELAY_DAYS_1 ?? 3);
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 3;
}

/** Giorni dopo confirmed_at per la 2ª nurture (default 10). */
export function nurtureDelayDays2(): number {
  const raw = Number(process.env.WAITLIST_NURTURE_DELAY_DAYS_2 ?? 10);
  const d1 = nurtureDelayDays1();
  const d2 = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 10;
  // La seconda deve arrivare dopo la prima.
  return Math.max(d2, d1 + 1);
}

function addDaysIso(anchorIso: string, days: number): string {
  const t = new Date(anchorIso).getTime() + days * 24 * 60 * 60 * 1000;
  return new Date(t).toISOString();
}

/**
 * Programma la sequenza nurture (step 0 → email #1 a +N1 giorni).
 * No-op se: niente email, già programmata/in corso, già fermata, o step > 0.
 */
export async function scheduleWaitlistNurture(
  db: ServiceClient,
  signupId: string,
  opts: { confirmedAt: string; email: string | null | undefined },
): Promise<void> {
  const email = opts.email?.trim();
  if (!email) return;

  const { data: row, error } = await db
    .from("waitlist_signups")
    .select("id, nurture_step, next_nurture_at, nurture_stopped_at")
    .eq("id", signupId)
    .maybeSingle();

  if (error || !row) {
    console.error("[waitlist-nurture] schedule lookup:", error);
    return;
  }

  if (row.nurture_stopped_at) return;
  if (row.nurture_step > 0) return;
  if (row.next_nurture_at) return;

  const nextAt = addDaysIso(opts.confirmedAt, nurtureDelayDays1());
  const { error: updateError } = await db
    .from("waitlist_signups")
    .update({
      nurture_step: 0,
      next_nurture_at: nextAt,
    })
    .eq("id", signupId);

  if (updateError) {
    console.error("[waitlist-nurture] schedule update:", updateError);
  }
}

/** Interrompe la sequenza per user_id e/o email (notifica stanza compatibile). */
export async function stopWaitlistNurture(
  db: ServiceClient,
  opts: { userId?: string | null; email?: string | null },
): Promise<void> {
  const now = new Date().toISOString();
  const patch = {
    nurture_stopped_at: now,
    next_nurture_at: null as string | null,
  };

  if (opts.userId) {
    const { error } = await db
      .from("waitlist_signups")
      .update(patch)
      .eq("user_id", opts.userId)
      .is("nurture_stopped_at", null);
    if (error) console.error("[waitlist-nurture] stop by user_id:", error);
  }

  const email = opts.email?.trim().toLowerCase();
  if (email) {
    // Match case-insensitive: fetch candidates then update (PostgREST ilike).
    const { data: rows, error: findError } = await db
      .from("waitlist_signups")
      .select("id")
      .ilike("email", email)
      .is("nurture_stopped_at", null);

    if (findError) {
      console.error("[waitlist-nurture] stop find by email:", findError);
      return;
    }
    if (!rows?.length) return;

    const { error } = await db
      .from("waitlist_signups")
      .update(patch)
      .in(
        "id",
        rows.map((r) => r.id),
      );
    if (error) console.error("[waitlist-nurture] stop by email:", error);
  }
}

export type NurtureProcessResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * Invia nurture in scadenza (usato dal cron Vercel).
 * Processa al massimo `limit` righe per invocazione.
 */
export async function processDueWaitlistNurture(
  db: ServiceClient,
  limit = 40,
): Promise<NurtureProcessResult> {
  const nowIso = new Date().toISOString();
  const result: NurtureProcessResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const { data: due, error } = await db
    .from("waitlist_signups")
    .select(
      "id, nome, email, preferred_locale, confirmed_at, nurture_step, next_nurture_at",
    )
    .lte("next_nurture_at", nowIso)
    .is("nurture_stopped_at", null)
    .not("confirmed_at", "is", null)
    .not("email", "is", null)
    .lt("nurture_step", 2)
    .order("next_nurture_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[waitlist-nurture] due query:", error);
    return result;
  }

  for (const row of due ?? []) {
    result.processed += 1;
    const email = row.email?.trim();
    if (!email || !row.confirmed_at) {
      result.skipped += 1;
      continue;
    }

    const locale = row.preferred_locale === "en" ? "en" : "it";
    const step = row.nurture_step ?? 0;

    if (step === 0) {
      const built = buildWaitlistNurtureMatchingEmail({
        nome: row.nome || "Ciao",
        locale,
      });
      const ok = await sendEmail({ to: email, ...built });
      if (!ok) {
        result.failed += 1;
        continue;
      }
      const nextAt = addDaysIso(row.confirmed_at, nurtureDelayDays2());
      const { error: upErr } = await db
        .from("waitlist_signups")
        .update({
          nurture_step: 1,
          nurture_1_sent_at: nowIso,
          next_nurture_at: nextAt,
        })
        .eq("id", row.id);
      if (upErr) {
        console.error("[waitlist-nurture] after #1 update:", upErr);
        result.failed += 1;
      } else {
        result.sent += 1;
      }
      continue;
    }

    if (step === 1) {
      const built = buildWaitlistNurtureLaunchEmail({
        nome: row.nome || "Ciao",
        locale,
      });
      const ok = await sendEmail({ to: email, ...built });
      if (!ok) {
        result.failed += 1;
        continue;
      }
      const { error: upErr } = await db
        .from("waitlist_signups")
        .update({
          nurture_step: 2,
          nurture_2_sent_at: nowIso,
          next_nurture_at: null,
        })
        .eq("id", row.id);
      if (upErr) {
        console.error("[waitlist-nurture] after #2 update:", upErr);
        result.failed += 1;
      } else {
        result.sent += 1;
      }
      continue;
    }

    result.skipped += 1;
  }

  return result;
}
