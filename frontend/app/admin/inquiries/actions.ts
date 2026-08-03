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
