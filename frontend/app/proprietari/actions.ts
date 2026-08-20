"use server";

import { headers } from "next/headers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, buildAdminInquiryEmail, buildInquiryConfirmationEmail } from "@/lib/email";

interface InquiryResult {
  error?: string;
  field?: "full_name" | "phone" | "email" | "form";
  success?: boolean;
}

const MAX_SUBMISSIONS_PER_HOUR = 3;
const MIN_FILL_TIME_MS = 2000;

export async function submitOwnerInquiry(formData: FormData): Promise<InquiryResult> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return { success: true };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const propertyAddress = String(formData.get("property_address") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName) return { error: "nameRequired", field: "full_name" };
  if (!phone) return { error: "phoneRequired", field: "phone" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "emailInvalid", field: "email" };
  }

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
    return { error: "rateLimited", field: "form" };
  }

  await rateLimitDb.from("form_rate_limits").insert({ ip_address: ip, form_name: "proprietari" });

  // Service role: nessun INSERT anon su owner_inquiries (RLS locked down).
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("owner_inquiries").insert({
    full_name: fullName,
    phone,
    email: email || null,
    property_address: propertyAddress || null,
    message: message || null,
  });

  if (error) {
    return { error: "errorGeneric", field: "form" };
  }

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

  if (email) {
    const confirmationEmail = buildInquiryConfirmationEmail({ fullName });
    await sendEmail({ to: email, ...confirmationEmail });
  }

  return { success: true };
}
