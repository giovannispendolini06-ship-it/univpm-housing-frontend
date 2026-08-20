"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { isInstitutionalEmail, type VerificationMethod } from "@/lib/verification";

async function getAuthedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Devi accedere per continuare.");
  return { supabase, user };
}

/** Studente: richiede verifica con email istituzionale (es. @studenti.univpm.it). */
export async function requestStudentVerification(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { user } = await getAuthedUser();
    const db = createServiceSupabaseClient();

    const { data: profile } = await db
      .from("users")
      .select("role, email, verification_status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      return { ok: false, error: "Solo gli studenti possono usare questa verifica." };
    }
    if (profile.verification_status === "verified") {
      return { ok: false, error: "Sei già verificato." };
    }

    const email = profile.email || user.email || "";
    if (!isInstitutionalEmail(email)) {
      return {
        ok: false,
        error:
          "Usa un’email istituzionale UNIVPM (es. @studenti.univpm.it) sull’account, oppure contattaci per verifica con documento.",
      };
    }

    const { error } = await db
      .from("users")
      .update({
        verification_status: "verified",
        verification_method: "institutional_email" satisfies VerificationMethod,
        verification_note: null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    revalidatePath("/owner");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}

/** Proprietario: richiede revisione manuale (documento proprietà/delega). */
export async function requestOwnerVerification(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { user } = await getAuthedUser();
    const db = createServiceSupabaseClient();

    const { data: profile } = await db
      .from("users")
      .select("role, verification_status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      return { ok: false, error: "Solo i proprietari possono richiedere questo badge." };
    }
    if (profile.verification_status === "verified") {
      return { ok: false, error: "Sei già verificato." };
    }
    if (profile.verification_status === "pending") {
      return { ok: false, error: "Richiesta già in revisione." };
    }

    const { error } = await db
      .from("users")
      .update({
        verification_status: "pending",
        verification_method: "ownership_document" satisfies VerificationMethod,
        verification_note: "In attesa di documento proprietà/delega (revisione admin).",
        verified_at: null,
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/owner");
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}
