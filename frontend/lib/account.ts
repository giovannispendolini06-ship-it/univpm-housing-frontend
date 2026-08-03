"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

interface DeleteAccountResult {
  error?: string;
}

/**
 * Chiunque sia loggato può eliminare SOLO il proprio account (nessun
 * controllo di ruolo qui: non serve, ognuno può cancellare sé stesso).
 * Se era un proprietario, i suoi immobili vengono eliminati a cascata
 * insieme a lui (stessa logica già usata lato admin) — per questo il
 * tasto in interfaccia deve avvisare chiaramente prima di procedere.
 */
export async function deleteOwnAccount(): Promise<DeleteAccountResult | void> {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const db = createServiceSupabaseClient();

  const { data: person } = await db
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (person?.avatar_url) {
    const path = person.avatar_url.split("/avatars/")[1];
    if (path) await db.storage.from("avatars").remove([path]);
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: `Errore nell'eliminazione dell'account: ${error.message}` };
  }

  // Ripulisce la sessione nel browser prima di mandare l'utente via —
  // senza questo, il cookie resterebbe con un riferimento a un account
  // che non esiste più.
  await authClient.auth.signOut();

  redirect("/login");
}
