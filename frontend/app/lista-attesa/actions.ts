"use server";

import { headers } from "next/headers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  sendEmail,
  buildAdminWaitlistEmail,
  buildWaitlistConfirmEmail,
} from "@/lib/email";
import {
  WAITLIST_CONFIRM_TTL_MS,
  computeWaitlistPosition,
  createWaitlistConfirmationToken,
  waitlistConfirmUrl,
} from "@/lib/waitlist";

interface WaitlistResult {
  error?: string;
  success?: boolean;
  /** pending = email DOI inviata; ok = già in lista (solo telefono) */
  status?: "pending" | "ok";
  /** Solo se status=ok (confermato): posizione reale 1-based */
  position?: number | null;
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

function resolveLocale(raw: string): "it" | "en" {
  return raw === "en" ? "en" : "it";
}

export async function submitWaitlistSignup(formData: FormData): Promise<WaitlistResult> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true, status: "ok" };
  }

  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return { success: true, status: "ok" };
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
  const locale = resolveLocale(String(formData.get("locale") ?? "it"));

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

  const needsEmailConfirm = Boolean(email);
  const now = new Date();
  const nowIso = now.toISOString();
  const token = needsEmailConfirm ? createWaitlistConfirmationToken() : null;

  const insertPayload = {
    nome,
    email: email || null,
    phone: phone || null,
    facolta,
    polo,
    budget: budget && !Number.isNaN(budget) ? budget : null,
    source,
    confirmed_at: needsEmailConfirm ? null : nowIso,
    confirmation_token: token,
    confirmation_sent_at: needsEmailConfirm ? nowIso : null,
    confirmation_expires_at: needsEmailConfirm
      ? new Date(now.getTime() + WAITLIST_CONFIRM_TTL_MS).toISOString()
      : null,
  };

  // Service role: waitlist RLS denies anon INSERT (DOI fields server-only).
  const supabase = createServiceSupabaseClient();
  const { data: inserted, error } = await supabase
    .from("waitlist_signups")
    .insert(insertPayload)
    .select("id, created_at")
    .single();

  if (error || !inserted) {
    console.error("[lista-attesa] insert error:", error);
    return { error: "errorGeneric" };
  }

  if (needsEmailConfirm && token && email) {
    const confirmEmail = buildWaitlistConfirmEmail({
      nome,
      confirmUrl: waitlistConfirmUrl(token),
      locale,
    });
    await sendEmail({ to: email, ...confirmEmail });
  }

  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL || "info@coabito.it";
  const adminEmail = buildAdminWaitlistEmail({
    nome,
    email: email || null,
    phone: phone || null,
    facolta,
    polo,
    budget: budget && !Number.isNaN(budget) ? budget : null,
    source,
    pendingConfirmation: needsEmailConfirm,
  });
  await sendEmail({ to: adminTo, ...adminEmail });

  if (needsEmailConfirm) {
    return { success: true, status: "pending" };
  }

  const position = await computeWaitlistPosition(supabase, {
    id: inserted.id,
    created_at: inserted.created_at,
  });

  return {
    success: true,
    status: "ok",
    position: position || null,
  };
}
