/**
 * Template WhatsApp CRM outbound.
 * Alias legacy: OWNER/STUDENT/FOLLOW_UP_* restano validi.
 * Nuovi: OWNER_FIRST_CONTACT, AGENCY_*, STUDENT_FIRST_CONTACT, …
 */

import { SITE_URL } from "@/lib/site";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export type WhatsAppTemplateType =
  | "OWNER"
  | "STUDENT"
  | "FOLLOW_UP_OWNER"
  | "FOLLOW_UP_STUDENT"
  | "OWNER_FIRST_CONTACT"
  | "OWNER_FOLLOW_UP"
  | "AGENCY_FIRST_CONTACT"
  | "AGENCY_FOLLOW_UP"
  | "STUDENT_FIRST_CONTACT"
  | "STUDENT_FOLLOW_UP"
  | "CUSTOM";

export type WhatsAppContactKind = "owner" | "student" | "agency";

export const WHATSAPP_TEMPLATE_VARS = [
  "firstName",
  "lastName",
  "city",
  "propertyName",
  "propertyLink",
  "coabitoLink",
  "agentName",
  "agencyName",
] as const;

export type WhatsAppTemplateVar = (typeof WHATSAPP_TEMPLATE_VARS)[number];

export type WhatsAppTemplateVars = Partial<
  Record<WhatsAppTemplateVar, string | null | undefined>
>;

export interface WhatsAppContactData extends WhatsAppTemplateVars {
  fullName?: string | null;
  phone?: string | null;
  contactType: WhatsAppContactKind;
}

export const WHATSAPP_TEMPLATE_LABELS: Record<
  Exclude<WhatsAppTemplateType, "CUSTOM">,
  string
> = {
  OWNER: "Primo contatto — Proprietario",
  OWNER_FIRST_CONTACT: "Primo contatto — Proprietario",
  STUDENT: "Primo contatto — Studente",
  STUDENT_FIRST_CONTACT: "Primo contatto — Studente",
  FOLLOW_UP_OWNER: "Follow-up — Proprietario",
  OWNER_FOLLOW_UP: "Follow-up — Proprietario",
  FOLLOW_UP_STUDENT: "Follow-up — Studente",
  STUDENT_FOLLOW_UP: "Follow-up — Studente",
  AGENCY_FIRST_CONTACT: "Primo contatto — Agenzia",
  AGENCY_FOLLOW_UP: "Follow-up — Agenzia",
};

const OWNER_PROPERTY_BLOCK = `🏠 Abbiamo visto questo immobile:
{{propertyLink}}`;

const STUDENT_PROPERTY_BLOCK = `🏠 Puoi vedere l'annuncio qui:
{{propertyLink}}`;

const OWNER_BODY = `Ciao {{firstName}}! 👋

Sono {{agentName}} di Coabito.

Ti contatto perché abbiamo visto il tuo annuncio e pensiamo possa essere interessante per gli studenti che utilizzano la nostra piattaforma.

🏠 Coabito mette in contatto studenti e proprietari, aiutando a trovare soluzioni abitative e coinquilini in modo semplice e organizzato.

Ci piacerebbe proporti di inserire il tuo immobile gratuitamente sul nostro marketplace.

Se ti interessa, posso spiegarti velocemente come funziona 😊

🌐 {{coabitoLink}}`;

const AGENCY_BODY = `Buongiorno {{firstName}},

sono {{agentName}} di Coabito.

Stiamo sviluppando una piattaforma dedicata al mercato degli affitti per studenti e giovani, mettendo in contatto direttamente domanda abitativa e proprietari/agenzie.

Abbiamo visto alcuni degli immobili{{#agencyName}} di {{agencyName}}{{/agencyName}} e pensiamo che Coabito possa rappresentare un ulteriore canale per dare visibilità ai vostri immobili e raggiungere studenti interessati.

Ci farebbe piacere presentarvi brevemente il progetto e mostrarvi come funziona.

🌐 {{coabitoLink}}

Se vi interessa, possiamo sentirci quando preferite.`;

const STUDENT_BODY = `Ciao {{firstName}}! 👋

Sono {{agentName}} di Coabito.

Ti contatto perché pensiamo che Coabito possa aiutarti a trovare una casa e dei coinquilini compatibili con il tuo stile di vita.

🏠 Con Coabito puoi cercare alloggi e coinquilini in modo semplice, creando un profilo e trovando persone con esigenze e preferenze compatibili.

Se vuoi, posso spiegarti velocemente come funziona 😊

🌐 {{coabitoLink}}`;

const OWNER_FOLLOW = `Ciao {{firstName}}! 👋

Ti scrivo nuovamente da Coabito per sapere se hai avuto modo di dare un'occhiata alla nostra piattaforma.

Se vuoi, posso spiegarti in 2 minuti come funziona e come possiamo aiutarti a inserire il tuo immobile 😊

🌐 {{coabitoLink}}`;

const AGENCY_FOLLOW = `Buongiorno {{firstName}},

riprendo contatto da Coabito riguardo a una possibile collaborazione per dare più visibilità ai vostri immobili dedicati agli studenti.

Se vi interessa, possiamo sentirci quando preferite.

🌐 {{coabitoLink}}`;

const STUDENT_FOLLOW = `Ciao {{firstName}}! 👋

Ti scrivo nuovamente da Coabito per sapere se hai avuto modo di dare un'occhiata alla nostra piattaforma.

Se vuoi, posso spiegarti in 2 minuti come funziona e come possiamo aiutarti 😊

🌐 {{coabitoLink}}`;

export const DEFAULT_WHATSAPP_TEMPLATES: Record<
  Exclude<WhatsAppTemplateType, "CUSTOM">,
  string
> = {
  OWNER: OWNER_BODY,
  OWNER_FIRST_CONTACT: OWNER_BODY,
  STUDENT: STUDENT_BODY,
  STUDENT_FIRST_CONTACT: STUDENT_BODY,
  FOLLOW_UP_OWNER: OWNER_FOLLOW,
  OWNER_FOLLOW_UP: OWNER_FOLLOW,
  FOLLOW_UP_STUDENT: STUDENT_FOLLOW,
  STUDENT_FOLLOW_UP: STUDENT_FOLLOW,
  AGENCY_FIRST_CONTACT: AGENCY_BODY,
  AGENCY_FOLLOW_UP: AGENCY_FOLLOW,
};

export function defaultAgentName(): string {
  return (process.env.NEXT_PUBLIC_AGENT_NAME || "Giovanni").trim() || "Giovanni";
}

export function defaultCoabitoLink(): string {
  return SITE_URL || "https://coabito.it";
}

export function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function sanitizeVar(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value).trim();
  if (!s || s === "undefined" || s === "null") return "";
  return s;
}

export function interpolateTemplate(
  template: string,
  vars: WhatsAppTemplateVars,
): string {
  const map: Record<string, string> = {};
  for (const key of WHATSAPP_TEMPLATE_VARS) {
    map[key] = sanitizeVar(vars[key]);
  }

  let out = template;

  out = out.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_m, key: string, inner: string) => (map[key] ? inner : ""),
  );

  out = out.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => map[key] ?? "");
  out = out.replace(/\{\{[^}]+\}\}/g, "");
  out = out.replace(/Ciao\s+!/g, "Ciao!");
  out = out.replace(/Ciao\s+,/g, "Ciao,");
  out = out.replace(/Buongiorno\s+,/g, "Buongiorno,");

  out = out
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return out;
}

export function resolveTemplateVars(
  contactData: WhatsAppContactData,
): WhatsAppTemplateVars {
  const fromName = splitFullName(contactData.fullName);
  return {
    firstName: sanitizeVar(contactData.firstName) || fromName.firstName,
    lastName: sanitizeVar(contactData.lastName) || fromName.lastName,
    city: sanitizeVar(contactData.city),
    propertyName: sanitizeVar(contactData.propertyName),
    propertyLink: sanitizeVar(contactData.propertyLink),
    coabitoLink: sanitizeVar(contactData.coabitoLink) || defaultCoabitoLink(),
    agentName: sanitizeVar(contactData.agentName) || defaultAgentName(),
    agencyName: sanitizeVar(contactData.agencyName),
  };
}

function canonicalizeTemplateType(type: WhatsAppTemplateType): WhatsAppTemplateType {
  if (type === "OWNER") return "OWNER_FIRST_CONTACT";
  if (type === "STUDENT") return "STUDENT_FIRST_CONTACT";
  if (type === "FOLLOW_UP_OWNER") return "OWNER_FOLLOW_UP";
  if (type === "FOLLOW_UP_STUDENT") return "STUDENT_FOLLOW_UP";
  return type;
}

export function buildWhatsAppMessage(
  type: WhatsAppTemplateType,
  contactData: WhatsAppContactData,
  customTemplate?: string | null,
  templateOverrides?: Partial<
    Record<Exclude<WhatsAppTemplateType, "CUSTOM">, string>
  >,
): string {
  const vars = resolveTemplateVars(contactData);
  const canonical = canonicalizeTemplateType(type);

  if (canonical === "CUSTOM" || type === "CUSTOM") {
    return interpolateTemplate(
      customTemplate?.trim() ||
        `Ciao {{firstName}}!\n\nSono {{agentName}} di Coabito.\n\n🌐 {{coabitoLink}}`,
      vars,
    );
  }

  const base =
    templateOverrides?.[canonical]?.trim() ||
    templateOverrides?.[type as Exclude<WhatsAppTemplateType, "CUSTOM">]?.trim() ||
    DEFAULT_WHATSAPP_TEMPLATES[canonical] ||
    DEFAULT_WHATSAPP_TEMPLATES.OWNER_FIRST_CONTACT;

  let message = interpolateTemplate(base, vars);

  if (vars.propertyLink) {
    const isStudent =
      canonical === "STUDENT_FIRST_CONTACT" || canonical === "STUDENT_FOLLOW_UP";
    const isOwner =
      canonical === "OWNER_FIRST_CONTACT" || canonical === "OWNER_FOLLOW_UP";
    if ((isStudent || isOwner) && !message.includes(vars.propertyLink)) {
      const block = interpolateTemplate(
        isStudent ? STUDENT_PROPERTY_BLOCK : OWNER_PROPERTY_BLOCK,
        vars,
      );
      if (block) message = `${message}\n\n${block}`;
    }
  }

  return message;
}

export function defaultTemplateForContact(
  contactType: WhatsAppContactKind,
  mode: "first" | "follow_up" | "custom",
): WhatsAppTemplateType {
  if (mode === "custom") return "CUSTOM";
  if (contactType === "agency") {
    return mode === "follow_up" ? "AGENCY_FOLLOW_UP" : "AGENCY_FIRST_CONTACT";
  }
  if (contactType === "owner") {
    return mode === "follow_up" ? "OWNER_FOLLOW_UP" : "OWNER_FIRST_CONTACT";
  }
  return mode === "follow_up" ? "STUDENT_FOLLOW_UP" : "STUDENT_FIRST_CONTACT";
}

export function contactTypeLabel(kind: WhatsAppContactKind): string {
  if (kind === "agency") return "Agenzia";
  return kind === "owner" ? "Proprietario" : "Studente";
}

/** Alias richiesto dallo spec CRM. */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  return createWhatsAppUrl(phone, message);
}
