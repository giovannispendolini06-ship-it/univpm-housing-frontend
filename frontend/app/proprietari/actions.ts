"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

interface InquiryResult {
  error?: string;
  success?: boolean;
}

export async function submitOwnerInquiry(formData: FormData): Promise<InquiryResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const propertyAddress = String(formData.get("property_address") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName) return { error: "Il nome è obbligatorio." };
  if (!phone) return { error: "Il telefono è obbligatorio." };

  // Client legato alla sessione (anche anonima): rispetta la policy RLS
  // "chiunque può inviare una richiesta", senza bisogno di privilegi extra.
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("owner_inquiries").insert({
    full_name: fullName,
    phone,
    email: email || null,
    property_address: propertyAddress || null,
    message: message || null,
  });

  if (error) {
    return {
      error:
        "Qualcosa è andato storto nell'invio. Riprova, o scrivici direttamente a info@bindo.it.",
    };
  }

  return { success: true };
}
