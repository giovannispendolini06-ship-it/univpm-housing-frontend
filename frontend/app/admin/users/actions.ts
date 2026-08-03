"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return user;
}

export async function updateUserProfile(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const userId = String(formData.get("user_id") ?? "");
  if (!userId) throw new Error("ID utente mancante.");

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) throw new Error("Il nome è obbligatorio.");

  const updates: Record<string, unknown> = {
    full_name: fullName,
    phone: String(formData.get("phone") ?? "").trim() || null,
    fiscal_code: String(formData.get("fiscal_code") ?? "").trim() || null,
    date_of_birth: String(formData.get("date_of_birth") ?? "").trim() || null,
  };

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const extension = avatarFile.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await db.storage
      .from("avatars")
      .upload(path, avatarFile, {
        contentType: avatarFile.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Errore nel caricamento della foto: ${uploadError.message}`);
    }

    const { data: publicUrlData } = db.storage.from("avatars").getPublicUrl(path);
    updates.avatar_url = publicUrlData.publicUrl;
  }

  const { error } = await db.from("users").update(updates).eq("id", userId);
  if (error) throw new Error(`Errore nel salvataggio: ${error.message}`);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect("/admin/users");
}

// ---------------------------------------------------------------------------
// Elimina completamente un account: prima la foto dallo Storage, poi
// l'account di autenticazione vero e proprio. Cancellare da auth.users fa
// "a cascata" anche su public.users e su tutto quello che dipende da lui
// (se era un proprietario, anche i SUOI IMMOBILI vengono cancellati insieme
// a lui — per questo il tasto in interfaccia chiede sempre conferma).
// ---------------------------------------------------------------------------
export async function deleteUser(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const userId = String(formData.get("user_id") ?? "");
  if (!userId) throw new Error("ID utente mancante.");

  const { data: person } = await db
    .from("users")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (person?.avatar_url) {
    const path = person.avatar_url.split("/avatars/")[1];
    if (path) await db.storage.from("avatars").remove([path]);
  }

  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Errore nell'eliminazione: ${error.message}`);

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
