"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  type WhatsAppTemplateType,
} from "@/lib/whatsapp-templates";

export type ContactEntityKind =
  | "user"
  | "landlord_lead"
  | "waitlist"
  | "property_owner";

export type ContactStartedPayload = {
  entityKind: ContactEntityKind;
  entityId: string;
  contactType: "owner" | "student";
  contactTemplate: WhatsAppTemplateType | string;
  source?: string;
};

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

function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /schema cache|does not exist|relation/i.test(error.message ?? "")
  );
}

/**
 * Registra apertura WhatsApp (Contatto avviato / WhatsApp aperto).
 * Non marca il messaggio come "inviato".
 * Soft-fail se la migration non è ancora applicata.
 */
export async function recordWhatsAppContactStarted(
  payload: ContactStartedPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const agent = await assertAdmin();
    const db = createServiceSupabaseClient();
    const now = new Date().toISOString();
    const status = "whatsapp_opened";
    const method = "whatsapp";
    const template = String(payload.contactTemplate || "CUSTOM");

    const { error: insertError } = await db.from("admin_contact_events").insert({
      entity_kind: payload.entityKind,
      entity_id: payload.entityId,
      contact_type: payload.contactType,
      contact_method: method,
      contact_template: template,
      contact_status: status,
      source: payload.source ?? null,
      agent_id: agent.id,
    });

    if (insertError && !isMissingRelation(insertError)) {
      return { ok: false, error: insertError.message };
    }

    // Aggiorna denormalizzato / CRM esistente
    if (payload.entityKind === "user") {
      const { error } = await db
        .from("users")
        .update({
          last_contacted_at: now,
          last_contact_method: method,
          last_contact_template: template,
          last_contact_status: status,
        })
        .eq("id", payload.entityId);
      if (error && !isMissingRelation(error) && !/column/i.test(error.message)) {
        // non bloccare l'apertura WA
      }
      revalidatePath(`/admin/users/${payload.entityId}`);
      revalidatePath("/admin/users");
    }

    if (payload.entityKind === "landlord_lead") {
      const { data: lead } = await db
        .from("landlord_leads")
        .select("stato")
        .eq("id", payload.entityId)
        .maybeSingle();

      const nextStato =
        lead?.stato === "da_contattare" ? "contattato_attesa" : lead?.stato;

      await db
        .from("landlord_leads")
        .update({
          data_ultimo_contatto: now.slice(0, 10),
          last_contact_method: method,
          last_contact_template: template,
          last_contact_status: status,
          ...(nextStato ? { stato: nextStato } : {}),
        })
        .eq("id", payload.entityId);

      revalidatePath(`/admin/pipeline/${payload.entityId}`);
      revalidatePath("/admin/pipeline");
    }

    if (payload.entityKind === "waitlist") {
      await db
        .from("waitlist_signups")
        .update({ contattato: true })
        .eq("id", payload.entityId);
      revalidatePath("/admin/waitlist");
    }

    if (payload.entityKind === "property_owner") {
      revalidatePath(`/admin/properties/${payload.entityId}`);
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore salvataggio contatto",
    };
  }
}

export type TemplateKey = keyof typeof DEFAULT_WHATSAPP_TEMPLATES;

export async function getWhatsAppTemplates(): Promise<
  Record<TemplateKey, string>
> {
  await assertAdmin();
  const merged = { ...DEFAULT_WHATSAPP_TEMPLATES };

  try {
    const db = createServiceSupabaseClient();
    const { data, error } = await db
      .from("whatsapp_message_templates")
      .select("template_key, body");

    if (error || !data) return merged;

    for (const row of data) {
      const key = row.template_key as TemplateKey;
      if (key in merged && typeof row.body === "string" && row.body.trim()) {
        merged[key] = row.body;
      }
    }
  } catch {
    /* defaults */
  }

  return merged;
}

export async function saveWhatsAppTemplate(
  templateKey: TemplateKey,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const agent = await assertAdmin();
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Il messaggio non può essere vuoto." };
  if (!(templateKey in DEFAULT_WHATSAPP_TEMPLATES)) {
    return { ok: false, error: "Template non valido." };
  }

  const db = createServiceSupabaseClient();
  const { error } = await db.from("whatsapp_message_templates").upsert(
    {
      template_key: templateKey,
      body: trimmed,
      updated_at: new Date().toISOString(),
      updated_by: agent.id,
    },
    { onConflict: "template_key" },
  );

  if (error) {
    if (isMissingRelation(error)) {
      return {
        ok: false,
        error:
          "Tabella whatsapp_message_templates assente. Esegui frontend/supabase/migration_whatsapp_contact.sql su Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings/whatsapp");
  return { ok: true };
}

export async function resetWhatsAppTemplate(
  templateKey: TemplateKey,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (!(templateKey in DEFAULT_WHATSAPP_TEMPLATES)) {
    return { ok: false, error: "Template non valido." };
  }

  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("whatsapp_message_templates")
    .delete()
    .eq("template_key", templateKey);

  if (error && !isMissingRelation(error)) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/settings/whatsapp");
  return { ok: true };
}
