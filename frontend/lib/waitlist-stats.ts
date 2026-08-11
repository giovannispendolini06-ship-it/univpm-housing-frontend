import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { WAITLIST_SOCIAL_PROOF_MIN } from "@/lib/waitlist-constants";

export { WAITLIST_SOCIAL_PROOF_MIN };

/**
 * Conta iscritti waitlist confermati (confirmed_at valorizzato).
 * In caso di errore / env mancante restituisce 0 (il counter non si mostra).
 */
export async function getConfirmedWaitlistCount(): Promise<number> {
  try {
    const db = createServiceSupabaseClient();
    const { count, error } = await db
      .from("waitlist_signups")
      .select("*", { count: "exact", head: true })
      .not("confirmed_at", "is", null);

    if (error) {
      console.error("[waitlist-stats] count error:", error);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("[waitlist-stats] unavailable:", err);
    return 0;
  }
}
