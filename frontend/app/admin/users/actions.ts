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
