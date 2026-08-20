import type { CrmContact, CrmContactType, CrmTimelineEventType } from "./types";
import { CRM_SEQUENCE_STOP_STATUSES } from "./types";

export function normalizePhoneKey(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function normalizeEmailKey(email: string | null | undefined): string | null {
  const e = email?.trim().toLowerCase();
  return e && e.includes("@") ? e : null;
}

export function normalizeWebsiteDomain(
  website: string | null | undefined,
): string | null {
  if (!website?.trim()) return null;
  try {
    const raw = website.includes("://") ? website : `https://${website}`;
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    return host || null;
  } catch {
    return website.trim().toLowerCase() || null;
  }
}

export function buildFullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null,
): string | null {
  const parts = [firstName, lastName].map((s) => s?.trim()).filter(Boolean);
  if (parts.length) return parts.join(" ");
  return fallback?.trim() || null;
}

export type DedupeCandidate = {
  email?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  website?: string | null;
  fullName?: string | null;
  city?: string | null;
  contactType?: CrmContactType;
};

/** Motivo per cui una sequenza/outreach non può partire. */
export function outreachBlockReason(
  contact: Pick<
    CrmContact,
    | "do_not_contact"
    | "email_opt_out"
    | "whatsapp_opt_out"
    | "status"
    | "last_contacted_at"
  >,
  channel: "email" | "whatsapp",
  opts?: { minHoursBetween?: number },
): string | null {
  if (contact.do_not_contact || contact.status === "DO_NOT_CONTACT") {
    return "Il contatto ha richiesto di non essere contattato.";
  }
  if (channel === "email" && contact.email_opt_out) {
    return "Il contatto si è disiscritto dalle email.";
  }
  if (channel === "whatsapp" && contact.whatsapp_opt_out) {
    return "Il contatto ha opt-out WhatsApp.";
  }
  if (CRM_SEQUENCE_STOP_STATUSES.includes(contact.status as never)) {
    if (contact.status === "CONVERTED" || contact.status === "PARTNER") {
      return "Contatto già convertito: sequenze fermate.";
    }
  }
  const minH = opts?.minHoursBetween ?? 12;
  if (contact.last_contacted_at) {
    const last = new Date(contact.last_contacted_at).getTime();
    if (Number.isFinite(last) && Date.now() - last < minH * 3600_000) {
      return "Contatto già raggiunto di recente.";
    }
  }
  return null;
}

export function shouldStopSequencesOnStatus(status: string): boolean {
  return CRM_SEQUENCE_STOP_STATUSES.includes(status as never);
}

export function timelineLabel(type: CrmTimelineEventType | string): string {
  const map: Record<string, string> = {
    CONTACT_CREATED: "Contatto creato",
    CONTACT_UPDATED: "Contatto aggiornato",
    STATUS_CHANGED: "Stato aggiornato",
    EMAIL_PREPARED: "Email preparata",
    EMAIL_SENT: "Email inviata",
    EMAIL_OPENED: "Email aperta",
    EMAIL_CLICKED: "Click su email",
    WHATSAPP_OPENED: "WhatsApp aperto",
    CALL_STARTED: "Chiamata avviata",
    FOLLOW_UP_SCHEDULED: "Follow-up programmato",
    FOLLOW_UP_CANCELLED: "Follow-up annullato",
    FOLLOW_UP_COMPLETED: "Follow-up completato",
    PROPERTY_ADDED: "Immobile collegato",
    PROPERTY_ONBOARDING_STARTED: "Onboarding immobile",
    PROPERTY_PUBLISHED: "Immobile pubblicato",
    CONTACT_REPLIED: "Ha risposto",
    CONTACT_CONVERTED: "Convertito",
    DO_NOT_CONTACT: "Non contattare",
    PARTNER_LINK_CLICKED: "Click link partner",
    SEQUENCE_ENROLLED: "Iscritto a sequenza",
    SEQUENCE_STOPPED: "Sequenza fermata",
    EMAIL_OPT_OUT: "Opt-out email",
    WHATSAPP_OPT_OUT: "Opt-out WhatsApp",
  };
  return map[type] ?? type;
}
