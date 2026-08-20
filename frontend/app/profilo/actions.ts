"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export type ProfileUpdateResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireUser() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { error: "unauthenticated" as const, user: null, role: null };

  const db = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    error: null,
    user,
    role: (profile?.role as string) ?? "student",
    db,
  };
}

const SEX_OK = new Set(["F", "M", "X", "prefer_not", ""]);

export async function updateProgressiveProfile(
  formData: FormData,
): Promise<ProfileUpdateResult> {
  const ctx = await requireUser();
  if (ctx.error || !ctx.user || !ctx.db) {
    return { ok: false, error: "Devi accedere per aggiornare il profilo." };
  }

  const firstName = String(formData.get("full_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();
  const placeOfBirth = String(formData.get("place_of_birth") ?? "").trim();
  const sexRaw = String(formData.get("sex") ?? "").trim();
  const guarantorRaw = String(formData.get("has_guarantor") ?? "").trim();
  const fiscalCode = String(formData.get("fiscal_code") ?? "").trim();
  const iban = String(formData.get("iban") ?? "").trim().replace(/\s+/g, "");
  const companyName = String(formData.get("company_name") ?? "").trim();

  if (!firstName) {
    return { ok: false, error: "Il nome è obbligatorio." };
  }
  if (sexRaw && !SEX_OK.has(sexRaw)) {
    return { ok: false, error: "Valore sesso non valido." };
  }

  let hasGuarantor: boolean | null = null;
  if (guarantorRaw === "yes") hasGuarantor = true;
  else if (guarantorRaw === "no") hasGuarantor = false;
  else if (guarantorRaw === "") hasGuarantor = null;

  const updates: Record<string, unknown> = {
    full_name: firstName,
    last_name: lastName || null,
    phone: phone || null,
    place_of_birth: placeOfBirth || null,
    sex: sexRaw || null,
  };

  if (ctx.role === "student") {
    updates.date_of_birth = dateOfBirth || null;
    updates.has_guarantor = hasGuarantor;
    // fiscal_code optional here — still allowed if they want to prefill
    if (fiscalCode) updates.fiscal_code = fiscalCode.toUpperCase();
  } else if (ctx.role === "owner") {
    updates.fiscal_code = fiscalCode ? fiscalCode.toUpperCase() : null;
    updates.iban = iban || null;
    updates.company_name = companyName || null;
  }

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { ok: false, error: "Foto troppo grande (max 5 MB)." };
    }
    const extension = avatarFile.name.split(".").pop() || "jpg";
    const path = `${ctx.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await ctx.db.storage
      .from("avatars")
      .upload(path, avatarFile, {
        contentType: avatarFile.type || "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }
    const { data: pub } = ctx.db.storage.from("avatars").getPublicUrl(path);
    updates.avatar_url = pub.publicUrl;
  }

  const { error } = await ctx.db
    .from("users")
    .update(updates)
    .eq("id", ctx.user.id);

  if (error) {
    console.error("[profilo] update", error.message);
    return { ok: false, error: "Salvataggio non riuscito. Riprova." };
  }

  revalidatePath("/profilo");
  revalidatePath("/dashboard");
  revalidatePath("/owner");
  return { ok: true };
}
