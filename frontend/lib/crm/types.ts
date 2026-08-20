/** Tipi e costanti CRM commerciale Coabito. */

export type CrmContactType = "OWNER" | "AGENCY" | "STUDENT" | "OTHER";

export type CrmContactStatus =
  | "NEW"
  | "TO_CONTACT"
  | "CONTACTED"
  | "REPLIED"
  | "INTERESTED"
  | "ONBOARDING"
  | "CONVERTED"
  | "NOT_INTERESTED"
  | "DO_NOT_CONTACT"
  | "PARTNERSHIP_DISCUSSION"
  | "PARTNER";

export type CrmContactSource =
  | "MANUAL"
  | "WEBSITE"
  | "MARKETPLACE"
  | "REFERRAL"
  | "PROPERTY_RESEARCH"
  | "AGENCY_RESEARCH"
  | "IMPORT"
  | "PIPELINE"
  | "INQUIRY"
  | "OTHER";

export type CrmPropertyLeadStatus =
  | "DISCOVERED"
  | "OWNER_UNKNOWN"
  | "OWNER_IDENTIFIED"
  | "TO_CONTACT"
  | "CONTACTED"
  | "INTERESTED"
  | "CLAIM_PENDING"
  | "CLAIMED"
  | "ONBOARDING"
  | "PUBLISHED"
  | "REJECTED";

export type CrmPropertySource =
  | "OWNER"
  | "AGENCY"
  | "MANUAL"
  | "MARKETPLACE"
  | "OTHER";

export type CrmTimelineEventType =
  | "CONTACT_CREATED"
  | "CONTACT_UPDATED"
  | "STATUS_CHANGED"
  | "EMAIL_PREPARED"
  | "EMAIL_SENT"
  | "EMAIL_OPENED"
  | "EMAIL_CLICKED"
  | "WHATSAPP_OPENED"
  | "CALL_STARTED"
  | "FOLLOW_UP_SCHEDULED"
  | "FOLLOW_UP_CANCELLED"
  | "FOLLOW_UP_COMPLETED"
  | "PROPERTY_ADDED"
  | "PROPERTY_ONBOARDING_STARTED"
  | "PROPERTY_PUBLISHED"
  | "CONTACT_REPLIED"
  | "CONTACT_CONVERTED"
  | "DO_NOT_CONTACT"
  | "PARTNER_LINK_CLICKED"
  | "SEQUENCE_ENROLLED"
  | "SEQUENCE_STOPPED"
  | "EMAIL_OPT_OUT"
  | "WHATSAPP_OPT_OUT";

export interface CrmContact {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  contact_type: CrmContactType;
  source: string | null;
  city: string | null;
  notes: string | null;
  status: CrmContactStatus;
  agency_name: string | null;
  website: string | null;
  contact_person: string | null;
  linked_user_id: string | null;
  linked_landlord_lead_id: string | null;
  linked_inquiry_id: string | null;
  property_count: number;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  do_not_contact: boolean;
  email_opt_out: boolean;
  whatsapp_opt_out: boolean;
  last_contact_method: string | null;
  last_contact_template: string | null;
  last_contact_status: string | null;
  assigned_to: string | null;
  sequence_stopped_at: string | null;
  sequence_stop_reason: string | null;
}

export interface CrmPropertyLead {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  address: string | null;
  city: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  source_url: string | null;
  source_name: string | null;
  property_source: string | null;
  images: unknown;
  contact_id: string | null;
  agency_contact_id: string | null;
  linked_property_id: string | null;
  linked_external_lead_id: string | null;
  status: CrmPropertyLeadStatus;
  discovered_at: string;
  contacted_at: string | null;
  claimed_at: string | null;
  published_at: string | null;
  notes: string | null;
}

export interface CrmTimelineEvent {
  id: string;
  created_at: string;
  contact_id: string | null;
  property_lead_id: string | null;
  event_type: CrmTimelineEventType | string;
  operator_id: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
}

export const CRM_CONTACT_STATUS_OPTIONS: {
  value: CrmContactStatus;
  label: string;
  pipeline: boolean;
}[] = [
  { value: "NEW", label: "Nuovo", pipeline: true },
  { value: "TO_CONTACT", label: "Da contattare", pipeline: true },
  { value: "CONTACTED", label: "Contattato", pipeline: true },
  { value: "REPLIED", label: "Ha risposto", pipeline: true },
  { value: "INTERESTED", label: "Interessato", pipeline: true },
  { value: "ONBOARDING", label: "Onboarding", pipeline: true },
  { value: "CONVERTED", label: "Convertito", pipeline: true },
  { value: "NOT_INTERESTED", label: "Non interessato", pipeline: true },
  { value: "DO_NOT_CONTACT", label: "Non contattare", pipeline: true },
  { value: "PARTNERSHIP_DISCUSSION", label: "Discussione partnership", pipeline: false },
  { value: "PARTNER", label: "Partner", pipeline: false },
];

export const CRM_PIPELINE_COLUMNS: CrmContactStatus[] = [
  "NEW",
  "TO_CONTACT",
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "ONBOARDING",
  "CONVERTED",
  "NOT_INTERESTED",
  "DO_NOT_CONTACT",
];

export const CRM_PIPELINE_LABELS: Record<CrmContactStatus, string> = {
  NEW: "🔎 Nuovo",
  TO_CONTACT: "📩 Da contattare",
  CONTACTED: "💬 Contattato",
  REPLIED: "💬 Ha risposto",
  INTERESTED: "🤝 Interessato",
  ONBOARDING: "🏠 Onboarding",
  CONVERTED: "✅ Convertito",
  NOT_INTERESTED: "❌ Non interessato",
  DO_NOT_CONTACT: "🚫 Non contattare",
  PARTNERSHIP_DISCUSSION: "Discussione partnership",
  PARTNER: "Partner",
};

export const CRM_STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sunset-500/15 text-sunset-600",
  TO_CONTACT: "bg-sand-400/25 text-ink",
  CONTACTED: "bg-[#25D366]/15 text-[#128C7E]",
  REPLIED: "bg-sea-50 text-sea-700",
  INTERESTED: "bg-sea-100 text-sea-800",
  ONBOARDING: "bg-sea-600/15 text-sea-700",
  CONVERTED: "bg-sea-600 text-white",
  NOT_INTERESTED: "bg-ink-muted/10 text-ink-muted",
  DO_NOT_CONTACT: "bg-ink/10 text-ink-muted",
  PARTNERSHIP_DISCUSSION: "bg-sea-50 text-sea-700",
  PARTNER: "bg-sea-600 text-white",
};

export const CRM_CONTACT_TYPE_LABELS: Record<CrmContactType, string> = {
  OWNER: "Proprietario",
  AGENCY: "Agenzia",
  STUDENT: "Studente",
  OTHER: "Altro",
};

export const CRM_SOURCE_OPTIONS: { value: CrmContactSource; label: string }[] = [
  { value: "MANUAL", label: "Manuale" },
  { value: "WEBSITE", label: "Sito" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "REFERRAL", label: "Referral" },
  { value: "PROPERTY_RESEARCH", label: "Ricerca immobili" },
  { value: "AGENCY_RESEARCH", label: "Ricerca agenzie" },
  { value: "IMPORT", label: "Import" },
  { value: "PIPELINE", label: "Pipeline" },
  { value: "INQUIRY", label: "Richiesta" },
  { value: "OTHER", label: "Altro" },
];

export const CRM_PROPERTY_STATUS_OPTIONS: {
  value: CrmPropertyLeadStatus;
  label: string;
}[] = [
  { value: "DISCOVERED", label: "Scoperto" },
  { value: "OWNER_UNKNOWN", label: "Proprietario sconosciuto" },
  { value: "OWNER_IDENTIFIED", label: "Proprietario identificato" },
  { value: "TO_CONTACT", label: "Da contattare" },
  { value: "CONTACTED", label: "Contattato" },
  { value: "INTERESTED", label: "Interessato" },
  { value: "CLAIM_PENDING", label: "Claim in attesa" },
  { value: "CLAIMED", label: "Rivendicato" },
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "PUBLISHED", label: "Pubblicato" },
  { value: "REJECTED", label: "Rifiutato" },
];

/** Stati che fermano automaticamente le sequenze. */
export const CRM_SEQUENCE_STOP_STATUSES: CrmContactStatus[] = [
  "REPLIED",
  "INTERESTED",
  "ONBOARDING",
  "CONVERTED",
  "NOT_INTERESTED",
  "DO_NOT_CONTACT",
  "PARTNER",
];

export function displayContactName(c: Pick<
  CrmContact,
  "full_name" | "first_name" | "last_name" | "agency_name" | "contact_type"
>): string {
  if (c.contact_type === "AGENCY" && c.agency_name?.trim()) {
    return c.agency_name.trim();
  }
  if (c.full_name?.trim()) return c.full_name.trim();
  const parts = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  return parts || "Senza nome";
}

export function primaryPhone(
  c: Pick<CrmContact, "whatsapp_phone" | "phone">,
): string | null {
  const p = (c.whatsapp_phone || c.phone || "").trim();
  return p || null;
}
