"use server";

import { headers } from "next/headers";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

interface WaitlistResult {
  error?: string;
  success?: boolean;
}

const MAX_SUBMISSIONS_PER_HOUR = 5;
const MIN_FILL_TIME_MS = 2000;

const SOURCE_MAP: Record<string, string> = {
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
};

function resolveSource(raw: string): string {
  return SOURCE_MAP[raw] ?? "lista_attesa";
}

export async function submitWaitlistSignup(formData: FormData): Promise<WaitlistResult> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return { success: true };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const facolta = String(formData.get("facolta") ?? "").trim() || null;
  const polo = String(formData.get("polo") ?? "").trim() || null;
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const budget = budgetRaw ? Number(budgetRaw) : null;
  const privacy = formData.get("privacy") === "on";
  const source = resolveSource(String(formData.get("source") ?? "lista_attesa"));

  if (!nome) return { error: "Il nome è obbligatorio." };
  if (!email && !phone) return { error: "contactRequired" };
  if (!privacy) return { error: "privacyRequired" };

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
    .eq("form_name", "lista_attesa")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
    return { error: "errorGeneric" };
  }

  await rateLimitDb
    .from("form_rate_limits")
    .insert({ ip_address: ip, form_name: "lista_attesa" });

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("waitlist_signups").insert({
    nome,
    email: email || null,
    phone: phone || null,
    facolta,
    polo,
    budget: budget && !Number.isNaN(budget) ? budget : null,
    source,
  });

  if (error) {
    console.error("[lista-attesa] insert error:", error);
    return { error: "errorGeneric" };
  }

  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL || "info@coabito.it";
  await sendEmail({
    to: adminTo,
    subject: `[Coabito] Nuova iscrizione lista d'attesa — ${nome}`,
    html: `
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email || "—"}</p>
      <p><strong>Telefono:</strong> ${phone || "—"}</p>
      <p><strong>Facoltà:</strong> ${facolta || "—"}</p>
      <p><strong>Polo:</strong> ${polo || "—"}</p>
      <p><strong>Budget:</strong> ${budget ?? "—"}</p>
      <p><strong>Fonte:</strong> ${source}</p>
    `,
  });

  return { success: true };
}
