"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import {
  type CrmContact,
  type CrmContactStatus,
  type CrmContactType,
  type CrmPropertyLead,
  type CrmPropertyLeadStatus,
  type CrmTimelineEventType,
} from "@/lib/crm/types";
import {
  buildFullName,
  normalizeEmailKey,
  normalizePhoneKey,
  normalizeWebsiteDomain,
  outreachBlockReason,
  shouldStopSequencesOnStatus,
  type DedupeCandidate,
} from "@/lib/crm/utils";
import {
  buildCrmEmail,
  DEFAULT_CRM_EMAIL_TEMPLATES,
  plainTextToEmailHtml,
  type CrmEmailTemplateKey,
} from "@/lib/crm/email-templates";
import { canSendCrmEmailNow, recordCrmEmailSend } from "@/lib/crm/rate-limit";

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

function missingCrmHint(): string {
  return "Tabelle CRM assenti. Esegui frontend/supabase/migration_crm_acquisition.sql su Supabase.";
}

export async function addTimelineEvent(input: {
  contactId?: string | null;
  propertyLeadId?: string | null;
  eventType: CrmTimelineEventType | string;
  source?: string;
  metadata?: Record<string, unknown>;
  operatorId?: string | null;
}): Promise<void> {
  try {
    const db = createServiceSupabaseClient();
    await db.from("crm_timeline_events").insert({
      contact_id: input.contactId ?? null,
      property_lead_id: input.propertyLeadId ?? null,
      event_type: input.eventType,
      operator_id: input.operatorId ?? null,
      source: input.source ?? "admin",
      metadata: input.metadata ?? {},
    });
  } catch {
    /* soft-fail */
  }
}

async function audit(
  operatorId: string,
  action: string,
  entityKind?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const db = createServiceSupabaseClient();
    await db.from("crm_audit_log").insert({
      operator_id: operatorId,
      action,
      entity_kind: entityKind ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    /* soft-fail */
  }
}

export async function findDuplicateContact(
  candidate: DedupeCandidate,
): Promise<CrmContact | null> {
  const db = createServiceSupabaseClient();
  const email = normalizeEmailKey(candidate.email);
  const phone =
    normalizePhoneKey(candidate.whatsappPhone) ||
    normalizePhoneKey(candidate.phone);
  const domain = normalizeWebsiteDomain(candidate.website);

  if (email) {
    const { data } = await db
      .from("crm_contacts")
      .select("*")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    if (data) return data as CrmContact;
  }

  if (phone) {
    const { data: rows } = await db
      .from("crm_contacts")
      .select("*")
      .or(`phone.ilike.%${phone.slice(-9)}%,whatsapp_phone.ilike.%${phone.slice(-9)}%`)
      .limit(20);
    const match = (rows as CrmContact[] | null)?.find((r) => {
      const a = normalizePhoneKey(r.phone);
      const b = normalizePhoneKey(r.whatsapp_phone);
      return a === phone || b === phone;
    });
    if (match) return match;
  }

  if (domain && candidate.contactType === "AGENCY") {
    const { data: rows } = await db
      .from("crm_contacts")
      .select("*")
      .eq("contact_type", "AGENCY")
      .not("website", "is", null)
      .limit(50);
    const match = (rows as CrmContact[] | null)?.find(
      (r) => normalizeWebsiteDomain(r.website) === domain,
    );
    if (match) return match;
  }

  if (candidate.fullName?.trim() && candidate.city?.trim()) {
    const { data } = await db
      .from("crm_contacts")
      .select("*")
      .ilike("full_name", candidate.fullName.trim())
      .ilike("city", candidate.city.trim())
      .limit(1)
      .maybeSingle();
    if (data) return data as CrmContact;
  }

  return null;
}

async function stopActiveSequences(
  contactId: string,
  reason: string,
  operatorId?: string,
) {
  const db = createServiceSupabaseClient();
  await db
    .from("crm_sequence_enrollments")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
      stop_reason: reason,
    })
    .eq("contact_id", contactId)
    .eq("status", "active");

  await db
    .from("crm_contacts")
    .update({
      sequence_stopped_at: new Date().toISOString(),
      sequence_stop_reason: reason,
    })
    .eq("id", contactId);

  await addTimelineEvent({
    contactId,
    eventType: "SEQUENCE_STOPPED",
    operatorId,
    metadata: { reason },
  });
}

export type UpsertContactInput = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  contactType: CrmContactType;
  source?: string | null;
  city?: string | null;
  notes?: string | null;
  status?: CrmContactStatus;
  agencyName?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  nextFollowUpAt?: string | null;
  doNotContact?: boolean;
  emailOptOut?: boolean;
  whatsappOptOut?: boolean;
  linkedLandlordLeadId?: string | null;
  linkedUserId?: string | null;
  linkedInquiryId?: string | null;
};

export async function upsertCrmContact(
  input: UpsertContactInput,
): Promise<{ ok: boolean; contact?: CrmContact; error?: string; deduped?: boolean }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();

  const fullName =
    buildFullName(input.firstName, input.lastName, input.fullName) ||
    input.agencyName?.trim() ||
    null;

  if (!input.id) {
    const dup = await findDuplicateContact({
      email: input.email,
      phone: input.phone,
      whatsappPhone: input.whatsappPhone,
      website: input.website,
      fullName,
      city: input.city,
      contactType: input.contactType,
    });
    if (dup) {
      const { data, error } = await db
        .from("crm_contacts")
        .update({
          first_name: input.firstName ?? dup.first_name,
          last_name: input.lastName ?? dup.last_name,
          full_name: fullName ?? dup.full_name,
          email: input.email ?? dup.email,
          phone: input.phone ?? dup.phone,
          whatsapp_phone: input.whatsappPhone ?? dup.whatsapp_phone,
          city: input.city ?? dup.city,
          notes: input.notes ?? dup.notes,
          agency_name: input.agencyName ?? dup.agency_name,
          website: input.website ?? dup.website,
          contact_person: input.contactPerson ?? dup.contact_person,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dup.id)
        .select("*")
        .single();
      if (error) {
        return {
          ok: false,
          error: isMissingRelation(error) ? missingCrmHint() : error.message,
        };
      }
      await addTimelineEvent({
        contactId: dup.id,
        eventType: "CONTACT_UPDATED",
        operatorId: operator.id,
        metadata: { deduped: true },
      });
      revalidateCrmPaths();
      return { ok: true, contact: data as CrmContact, deduped: true };
    }
  }

  const row = {
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    full_name: fullName,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    whatsapp_phone: input.whatsappPhone?.trim() || input.phone?.trim() || null,
    contact_type: input.contactType,
    source: input.source ?? "MANUAL",
    city: input.city ?? "Ancona",
    notes: input.notes ?? null,
    status: input.status ?? "NEW",
    agency_name: input.agencyName ?? null,
    website: input.website ?? null,
    contact_person: input.contactPerson ?? null,
    next_follow_up_at: input.nextFollowUpAt || null,
    do_not_contact: input.doNotContact ?? false,
    email_opt_out: input.emailOptOut ?? false,
    whatsapp_opt_out: input.whatsappOptOut ?? false,
    linked_landlord_lead_id: input.linkedLandlordLeadId ?? null,
    linked_user_id: input.linkedUserId ?? null,
    linked_inquiry_id: input.linkedInquiryId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db
      .from("crm_contacts")
      .update(row)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) {
      return {
        ok: false,
        error: isMissingRelation(error) ? missingCrmHint() : error.message,
      };
    }
    await addTimelineEvent({
      contactId: input.id,
      eventType: "CONTACT_UPDATED",
      operatorId: operator.id,
    });
    await audit(operator.id, "contact_update", "crm_contact", input.id);
    revalidateCrmPaths(input.id);
    return { ok: true, contact: data as CrmContact };
  }

  const { data, error } = await db
    .from("crm_contacts")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: isMissingRelation(error) ? missingCrmHint() : error.message,
    };
  }

  await addTimelineEvent({
    contactId: data.id,
    eventType: "CONTACT_CREATED",
    operatorId: operator.id,
  });
  await audit(operator.id, "contact_create", "crm_contact", data.id);
  revalidateCrmPaths(data.id);
  return { ok: true, contact: data as CrmContact };
}

function revalidateCrmPaths(contactId?: string) {
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/owners");
  revalidatePath("/admin/crm/agencies");
  revalidatePath("/admin/crm/pipeline");
  revalidatePath("/admin/crm/properties");
  revalidatePath("/admin/crm/dashboard");
  if (contactId) revalidatePath(`/admin/crm/contacts/${contactId}`);
}

export async function updateCrmContactStatus(
  contactId: string,
  status: CrmContactStatus,
): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "DO_NOT_CONTACT") {
    patch.do_not_contact = true;
  }

  const { error } = await db.from("crm_contacts").update(patch).eq("id", contactId);
  if (error) {
    return {
      ok: false,
      error: isMissingRelation(error) ? missingCrmHint() : error.message,
    };
  }

  await addTimelineEvent({
    contactId,
    eventType: status === "DO_NOT_CONTACT" ? "DO_NOT_CONTACT" : "STATUS_CHANGED",
    operatorId: operator.id,
    metadata: { status },
  });

  if (shouldStopSequencesOnStatus(status)) {
    await stopActiveSequences(contactId, `status:${status}`, operator.id);
  }

  if (status === "CONVERTED" || status === "PARTNER") {
    await addTimelineEvent({
      contactId,
      eventType: "CONTACT_CONVERTED",
      operatorId: operator.id,
    });
  }

  revalidateCrmPaths(contactId);
  return { ok: true };
}

export async function scheduleFollowUp(
  contactId: string,
  nextFollowUpAt: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("crm_contacts")
    .update({
      next_follow_up_at: nextFollowUpAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId);

  if (error) {
    return {
      ok: false,
      error: isMissingRelation(error)
        ? missingCrmHint()
        : "Impossibile programmare il follow-up.",
    };
  }

  await addTimelineEvent({
    contactId,
    eventType: nextFollowUpAt ? "FOLLOW_UP_SCHEDULED" : "FOLLOW_UP_CANCELLED",
    operatorId: operator.id,
    metadata: { nextFollowUpAt },
  });
  revalidateCrmPaths(contactId);
  return { ok: true };
}

export async function completeFollowUp(
  contactId: string,
): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { error } = await db
    .from("crm_contacts")
    .update({
      next_follow_up_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId);
  if (error) return { ok: false, error: error.message };
  await addTimelineEvent({
    contactId,
    eventType: "FOLLOW_UP_COMPLETED",
    operatorId: operator.id,
  });
  revalidateCrmPaths(contactId);
  return { ok: true };
}

export async function recordCrmWhatsAppOpened(input: {
  contactId: string;
  template: string;
  source?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { data: contact } = await db
    .from("crm_contacts")
    .select("*")
    .eq("id", input.contactId)
    .maybeSingle();

  if (!contact) return { ok: false, error: "Contatto non trovato." };

  const block = outreachBlockReason(contact as CrmContact, "whatsapp", {
    minHoursBetween: 0,
  });
  if (block && (contact as CrmContact).do_not_contact) {
    return { ok: false, error: block };
  }

  const now = new Date().toISOString();
  const nextStatus =
    contact.status === "NEW" || contact.status === "TO_CONTACT"
      ? "CONTACTED"
      : contact.status;

  await db
    .from("crm_contacts")
    .update({
      last_contacted_at: now,
      last_contact_method: "whatsapp",
      last_contact_template: input.template,
      last_contact_status: "whatsapp_opened",
      status: nextStatus,
      updated_at: now,
      next_follow_up_at:
        contact.next_follow_up_at ||
        new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10),
    })
    .eq("id", input.contactId);

  await addTimelineEvent({
    contactId: input.contactId,
    eventType: "WHATSAPP_OPENED",
    operatorId: operator.id,
    source: input.source,
    metadata: { template: input.template },
  });

  revalidateCrmPaths(input.contactId);
  return { ok: true };
}

export async function sendCrmEmail(input: {
  contactId: string;
  templateKey: CrmEmailTemplateKey;
  subject?: string;
  body?: string;
  propertyName?: string | null;
  propertyLink?: string | null;
  partnerToken?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { data: contact } = await db
    .from("crm_contacts")
    .select("*")
    .eq("id", input.contactId)
    .maybeSingle();

  if (!contact) return { ok: false, error: "Contatto non trovato." };
  const c = contact as CrmContact;

  const block = outreachBlockReason(c, "email", { minHoursBetween: 0 });
  if (block) return { ok: false, error: block };
  if (!c.email?.trim()) {
    return { ok: false, error: "Questo contatto non ha un'email valida." };
  }

  const rate = canSendCrmEmailNow();
  if (!rate.ok) return { ok: false, error: rate.reason };

  const built = buildCrmEmail(input.templateKey, {
    firstName: c.first_name,
    lastName: c.last_name,
    city: c.city,
    agencyName: c.agency_name,
    propertyName: input.propertyName,
    propertyLink: input.propertyLink,
    coabitoLink: input.partnerToken
      ? `${SITE_URL}/partner/${input.partnerToken}`
      : SITE_URL,
  });

  const subject = input.subject?.trim() || built.subject;
  const body = input.body?.trim() || built.body;

  await addTimelineEvent({
    contactId: input.contactId,
    eventType: "EMAIL_PREPARED",
    operatorId: operator.id,
    metadata: { template: input.templateKey },
  });

  const unsubToken = await ensurePartnerToken(input.contactId);
  const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(unsubToken)}&channel=email`;

  const sent = await sendEmail({
    to: c.email,
    subject,
    html: plainTextToEmailHtml(body, unsubUrl),
  });

  if (!sent) {
    return {
      ok: false,
      error:
        "Non è stato possibile inviare l'email. Verifica RESEND_API_KEY o riprova.",
    };
  }

  recordCrmEmailSend();

  const now = new Date().toISOString();
  const nextStatus =
    c.status === "NEW" || c.status === "TO_CONTACT" ? "CONTACTED" : c.status;

  await db
    .from("crm_contacts")
    .update({
      last_contacted_at: now,
      last_contact_method: "email",
      last_contact_template: input.templateKey,
      last_contact_status: "email_sent",
      status: nextStatus,
      updated_at: now,
      next_follow_up_at:
        c.next_follow_up_at ||
        new Date(Date.now() + 4 * 86400_000).toISOString().slice(0, 10),
    })
    .eq("id", input.contactId);

  await addTimelineEvent({
    contactId: input.contactId,
    eventType: "EMAIL_SENT",
    operatorId: operator.id,
    metadata: { template: input.templateKey, subject },
  });
  await audit(operator.id, "email_sent", "crm_contact", input.contactId, {
    template: input.templateKey,
  });

  revalidateCrmPaths(input.contactId);
  return { ok: true };
}

export async function ensurePartnerToken(
  contactId: string,
  propertyLeadId?: string | null,
): Promise<string> {
  const db = createServiceSupabaseClient();
  const { data: existing } = await db
    .from("crm_partner_tokens")
    .select("token")
    .eq("contact_id", contactId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.token) return existing.token as string;

  const token = randomBytes(24).toString("hex");
  await db.from("crm_partner_tokens").insert({
    token,
    contact_id: contactId,
    property_lead_id: propertyLeadId ?? null,
  });
  return token;
}

export async function createPartnerLink(
  contactId: string,
  propertyLeadId?: string | null,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await assertAdmin();
  try {
    const token = await ensurePartnerToken(contactId, propertyLeadId);
    return { ok: true, url: `${SITE_URL}/partner/${token}` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : missingCrmHint(),
    };
  }
}

export async function upsertPropertyLead(input: {
  id?: string;
  title?: string | null;
  address?: string | null;
  city?: string | null;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  propertySource?: string | null;
  contactId?: string | null;
  agencyContactId?: string | null;
  status?: CrmPropertyLeadStatus;
  notes?: string | null;
}): Promise<{ ok: boolean; lead?: CrmPropertyLead; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const row = {
    title: input.title ?? null,
    address: input.address ?? null,
    city: input.city ?? "Ancona",
    price: input.price ?? null,
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    description: input.description ?? null,
    source_url: input.sourceUrl ?? null,
    source_name: input.sourceName ?? null,
    property_source: input.propertySource ?? "MANUAL",
    contact_id: input.contactId ?? null,
    agency_contact_id: input.agencyContactId ?? null,
    status: input.status ?? "DISCOVERED",
    notes: input.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  const q = input.id
    ? db.from("crm_property_leads").update(row).eq("id", input.id)
    : db.from("crm_property_leads").insert(row);

  const { data, error } = await q.select("*").single();
  if (error) {
    return {
      ok: false,
      error: isMissingRelation(error) ? missingCrmHint() : error.message,
    };
  }

  if (input.contactId) {
    await addTimelineEvent({
      contactId: input.contactId,
      propertyLeadId: data.id,
      eventType: "PROPERTY_ADDED",
      operatorId: operator.id,
    });
    await refreshPropertyCount(input.contactId);
  }

  revalidatePath("/admin/crm/properties");
  if (input.contactId) revalidateCrmPaths(input.contactId);
  return { ok: true, lead: data as CrmPropertyLead };
}

async function refreshPropertyCount(contactId: string) {
  const db = createServiceSupabaseClient();
  const { count } = await db
    .from("crm_property_leads")
    .select("*", { count: "exact", head: true })
    .or(`contact_id.eq.${contactId},agency_contact_id.eq.${contactId}`);
  await db
    .from("crm_contacts")
    .update({ property_count: count ?? 0 })
    .eq("id", contactId);
}

export async function enrollInDefaultSequence(
  contactId: string,
): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { data: contact } = await db
    .from("crm_contacts")
    .select("*")
    .eq("id", contactId)
    .maybeSingle();
  if (!contact) return { ok: false, error: "Contatto non trovato." };
  const c = contact as CrmContact;
  if (c.do_not_contact) {
    return { ok: false, error: "Il contatto ha richiesto di non essere contattato." };
  }

  const audience =
    c.contact_type === "AGENCY"
      ? "AGENCY"
      : c.contact_type === "STUDENT"
        ? "STUDENT"
        : "OWNER";

  const { data: seq } = await db
    .from("crm_sequences")
    .select("*")
    .eq("audience", audience)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!seq) {
    return { ok: false, error: "Nessuna sequenza attiva per questo tipo." };
  }

  const { error } = await db.from("crm_sequence_enrollments").upsert(
    {
      contact_id: contactId,
      sequence_id: seq.id,
      current_step: 0,
      status: "active",
      next_run_at: new Date().toISOString(),
      stopped_at: null,
      stop_reason: null,
    },
    { onConflict: "contact_id,sequence_id" },
  );

  if (error) {
    return {
      ok: false,
      error: isMissingRelation(error) ? missingCrmHint() : error.message,
    };
  }

  await addTimelineEvent({
    contactId,
    eventType: "SEQUENCE_ENROLLED",
    operatorId: operator.id,
    metadata: { sequenceId: seq.id, name: seq.name },
  });
  revalidateCrmPaths(contactId);
  return { ok: true };
}

export async function importContactsFromLandlordLeads(): Promise<{
  ok: boolean;
  imported?: number;
  error?: string;
}> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const { data: leads, error } = await db.from("landlord_leads").select("*");
  if (error) return { ok: false, error: error.message };

  let imported = 0;
  for (const lead of leads ?? []) {
    const existing = await findDuplicateContact({
      email: lead.email,
      phone: lead.telefono,
      fullName: lead.nome,
      city: "Ancona",
      contactType: "OWNER",
    });
    if (existing) {
      if (!existing.linked_landlord_lead_id) {
        await db
          .from("crm_contacts")
          .update({ linked_landlord_lead_id: lead.id })
          .eq("id", existing.id);
      }
      continue;
    }
    const res = await upsertCrmContact({
      firstName: lead.nome?.split(" ")[0] ?? lead.nome,
      lastName: lead.nome?.split(" ").slice(1).join(" ") || null,
      fullName: lead.nome,
      email: lead.email,
      phone: lead.telefono,
      whatsappPhone: lead.telefono,
      contactType: "OWNER",
      source: "PIPELINE",
      city: "Ancona",
      notes: lead.note,
      status:
        lead.stato === "da_contattare"
          ? "TO_CONTACT"
          : lead.stato === "chiuso_positivo"
            ? "CONVERTED"
            : lead.stato === "rifiutato"
              ? "NOT_INTERESTED"
              : "CONTACTED",
      nextFollowUpAt: lead.data_prossimo_followup,
      linkedLandlordLeadId: lead.id,
    });
    if (res.ok) imported += 1;
  }

  await audit(operator.id, "import_landlord_leads", "crm_contacts", undefined, {
    imported,
  });
  revalidateCrmPaths();
  return { ok: true, imported };
}

export async function getCrmEmailTemplateDefaults() {
  await assertAdmin();
  return DEFAULT_CRM_EMAIL_TEMPLATES;
}

export async function setContactOptOut(input: {
  contactId: string;
  emailOptOut?: boolean;
  whatsappOptOut?: boolean;
  doNotContact?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const operator = await assertAdmin();
  const db = createServiceSupabaseClient();
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.emailOptOut != null) patch.email_opt_out = input.emailOptOut;
  if (input.whatsappOptOut != null) patch.whatsapp_opt_out = input.whatsappOptOut;
  if (input.doNotContact != null) {
    patch.do_not_contact = input.doNotContact;
    if (input.doNotContact) patch.status = "DO_NOT_CONTACT";
  }

  const { error } = await db
    .from("crm_contacts")
    .update(patch)
    .eq("id", input.contactId);
  if (error) return { ok: false, error: error.message };

  if (input.emailOptOut) {
    await addTimelineEvent({
      contactId: input.contactId,
      eventType: "EMAIL_OPT_OUT",
      operatorId: operator.id,
    });
  }
  if (input.whatsappOptOut) {
    await addTimelineEvent({
      contactId: input.contactId,
      eventType: "WHATSAPP_OPT_OUT",
      operatorId: operator.id,
    });
  }
  if (input.doNotContact) {
    await stopActiveSequences(input.contactId, "do_not_contact", operator.id);
  } else if (input.emailOptOut || input.whatsappOptOut) {
    await stopActiveSequences(input.contactId, "opt_out", operator.id);
  }

  await audit(operator.id, "opt_out_change", "crm_contact", input.contactId, patch);
  revalidateCrmPaths(input.contactId);
  return { ok: true };
}
