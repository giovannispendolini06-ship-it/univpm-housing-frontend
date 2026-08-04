"use server";

import { headers } from "next/headers";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { sendEmail, buildAdminInquiryEmail, buildInquiryConfirmationEmail } from "@/lib/email";

interface InquiryResult {
  error?: string;
  success?: boolean;
}

const MAX_SUBMISSIONS_PER_HOUR = 3;
const MIN_FILL_TIME_MS = 2000; // sotto questa soglia, quasi certamente un bot

export async function submitOwnerInquiry(formData: FormData): Promise<InquiryResult> {
  // --- Protezione 1: campo trappola -----------------------------------------
  // "website" è un campo nascosto agli occhi umani (vedi OwnerInquiryForm):
  // se arriva compilato, è quasi certamente un bot che riempie tutti i
  // campi che trova. Rispondiamo "successo" senza salvare nulla, così il
  // bot non capisce di essere stato bloccato e non prova ad adattarsi.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  // --- Protezione 2: tempo di compilazione ----------------------------------
  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return { success: true };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const propertyAddress = String(formData.get("property_address") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName) return { error: "Il nome è obbligatorio." };
  if (!phone) return { error: "Il telefono è obbligatorio." };

  // --- Protezione 3: limite di invii per indirizzo --------------------------
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const rateLimitDb = createServiceSupabaseClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await rateLimitDb
    .from("form_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("form_name", "proprietari")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
    return {
      error:
        "Hai inviato troppe richieste in poco tempo. Riprova tra un'ora, o scrivici direttamente a info@coabito.it.",
    };
  }

  await rateLimitDb.from("form_rate_limits").insert({ ip_address: ip, form_name: "proprietari" });

  // --- Salvataggio vero e proprio -------------------------------------------
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
        "Qualcosa è andato storto nell'invio. Riprova, o scrivici direttamente a info@coabito.it.",
    };
  }

  // --- Notifica a te: così non devi controllare il pannello a mano -------
  const adminEmail = buildAdminInquiryEmail({
    fullName,
    phone,
    email,
    propertyAddress,
    message,
  });
  await sendEmail({
    to: process.env.ADMIN_NOTIFICATION_EMAIL || "info@coabito.it",
    ...adminEmail,
  });

  // --- Conferma di ricezione a chi ha scritto -----------------------------
  if (email) {
    const confirmationEmail = buildInquiryConfirmationEmail({ fullName });
    await sendEmail({ to: email, ...confirmationEmail });
  }

  return { success: true };
}
