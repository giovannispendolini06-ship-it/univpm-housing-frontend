"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendEmail, buildPaymentLateEmail, buildPaymentConfirmedEmail } from "@/lib/email";

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

async function upsertPayment(formData: FormData, status: "pagato" | "in_ritardo") {
  await assertAdmin();
  const db = createServiceSupabaseClient();

  const tenancyId = String(formData.get("tenancy_id") ?? "");
  const periodMonth = String(formData.get("period_month") ?? "");
  const amountDue = Number(formData.get("amount_due") ?? 0);

  if (!tenancyId || !periodMonth) throw new Error("Dati mancanti.");

  const { error } = await db.from("rent_payments").upsert(
    {
      tenancy_id: tenancyId,
      period_month: periodMonth,
      amount_due: amountDue,
      status,
      paid_at: status === "pagato" ? new Date().toISOString().slice(0, 10) : null,
    },
    { onConflict: "tenancy_id,period_month" },
  );

  if (error) throw new Error(`Errore nel salvataggio: ${error.message}`);

  // Email allo studente: promemoria se in ritardo, conferma se pagato.
  // Non blocca mai il salvataggio se fallisce.
  const { data: tenancy } = await db
    .from("room_tenancies")
    .select("users:student_id ( full_name, email, preferred_locale )")
    .eq("id", tenancyId)
    .maybeSingle();

  const student = (tenancy as any)?.users;
  if (student?.email) {
    const locale: "it" | "en" = student.preferred_locale === "en" ? "en" : "it";
    const periodLabel = new Date(periodMonth).toLocaleDateString(
      locale === "en" ? "en-GB" : "it-IT",
      { month: "long", year: "numeric" },
    );

    const { subject, html } =
      status === "in_ritardo"
        ? buildPaymentLateEmail({ fullName: student.full_name ?? "", amountDue, periodLabel, locale })
        : buildPaymentConfirmedEmail({ fullName: student.full_name ?? "", amountDue, periodLabel, locale });

    sendEmail({ to: student.email, subject, html });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function markPaymentPaid(formData: FormData) {
  await upsertPayment(formData, "pagato");
}

export async function markPaymentLate(formData: FormData) {
  await upsertPayment(formData, "in_ritardo");
}
