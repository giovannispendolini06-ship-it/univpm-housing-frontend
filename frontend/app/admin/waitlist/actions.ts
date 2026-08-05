"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

async function assertAdmin() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) throw new Error("Non autenticato.");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Accesso negato.");
}

export async function toggleWaitlistContattato(
  signupId: string,
  contattato: boolean,
): Promise<void> {
  await assertAdmin();

  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("waitlist_signups")
    .update({ contattato })
    .eq("id", signupId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/waitlist");
}

export async function updateWaitlistNotes(signupId: string, notes: string): Promise<void> {
  await assertAdmin();

  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("waitlist_signups")
    .update({ note: notes.trim() || null })
    .eq("id", signupId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/waitlist");
}
