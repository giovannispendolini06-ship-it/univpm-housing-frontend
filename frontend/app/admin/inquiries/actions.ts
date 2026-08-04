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

export async function updateInquiryStatus(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const inquiryId = String(formData.get("inquiry_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!inquiryId || !status) throw new Error("Dati mancanti.");

  const { error } = await db
    .from("owner_inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) throw new Error(`Errore nell'aggiornamento: ${error.message}`);

  revalidatePath("/admin/inquiries");
}

// ---------------------------------------------------------------------------
// Modifica i dati di una richiesta (correggere un refuso, un numero
// sbagliato, ecc.)
// ---------------------------------------------------------------------------
export async function updateInquiry(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const inquiryId = String(formData.get("inquiry_id") ?? "");
  if (!inquiryId) throw new Error("ID richiesta mancante.");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName) throw new Error("Il nome è obbligatorio.");
  if (!phone) throw new Error("Il telefono è obbligatorio.");

  const { error } = await db
    .from("owner_inquiries")
    .update({
      full_name: fullName,
      phone,
      email: String(formData.get("email") ?? "").trim() || null,
      property_address: String(formData.get("property_address") ?? "").trim() || null,
      message: String(formData.get("message") ?? "").trim() || null,
    })
    .eq("id", inquiryId);

  if (error) throw new Error(`Errore nell'aggiornamento: ${error.message}`);

  revalidatePath("/admin/inquiries");
}

// ---------------------------------------------------------------------------
// Elimina una richiesta (es. spam passato dai filtri, o duplicato)
// ---------------------------------------------------------------------------
export async function deleteInquiry(formData: FormData) {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const inquiryId = String(formData.get("inquiry_id") ?? "");
  if (!inquiryId) throw new Error("ID richiesta mancante.");

  const { error } = await db.from("owner_inquiries").delete().eq("id", inquiryId);
  if (error) throw new Error(`Errore nell'eliminazione: ${error.message}`);

  revalidatePath("/admin/inquiries");
}
