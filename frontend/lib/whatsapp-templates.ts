/**
 * Template WhatsApp per contatto outbound (admin CRM).
 * Variabili: {{firstName}} {{lastName}} {{city}} {{propertyName}}
 * {{propertyLink}} {{coabitoLink}} {{agentName}}
 *
 * Le variabili vuote non lasciano "undefined"/"null"/frasi spezzate:
 * - placeholder assenti → rimossi
 * - sezioni opzionali (es. link annuncio) → solo se il valore c'è
 */

import { SITE_URL } from "@/lib/site";

export type WhatsAppTemplateType =
  | "OWNER"
  | "STUDENT"
  | "FOLLOW_UP_OWNER"
  | "FOLLOW_UP_STUDENT"
  | "CUSTOM";

export type WhatsAppContactKind = "owner" | "student";

export const WHATSAPP_TEMPLATE_VARS = [
  "firstName",
  "lastName",
  "city",
  "propertyName",
  "propertyLink",
  "coabitoLink",
  "agentName",
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
  STUDENT: "Primo contatto — Studente",
  FOLLOW_UP_OWNER: "Follow-up — Proprietario",
  FOLLOW_UP_STUDENT: "Follow-up — Studente",
};

const STUDENT_PROPERTY_BLOCK = `🏠 Puoi vedere l'annuncio qui:
{{propertyLink}}`;

export const DEFAULT_WHATSAPP_TEMPLATES: Record<
  Exclude<WhatsAppTemplateType, "CUSTOM">,
  string
> = {
  OWNER: `Ciao {{firstName}}! 👋

Sono {{agentName}} di Coabito.

Ti contatto perché abbiamo visto il tuo annuncio{{#propertyName}} «{{propertyName}}»{{/propertyName}} e pensiamo possa essere interessante per gli studenti che utilizzano la nostra piattaforma.

🏠 Coabito aiuta proprietari e studenti a trovare il coinquilino ideale, rendendo la ricerca più semplice e organizzata.

Puoi pubblicizzare il tuo alloggio e ricevere richieste da studenti interessati e compatibili.

Ti va di scoprire come funziona? 😊

🌐 {{coabitoLink}}`,

  STUDENT: `Ciao {{firstName}}! 👋

Sono {{agentName}} di Coabito.

Ti contatto perché pensiamo che Coabito possa aiutarti a trovare una casa e dei coinquilini compatibili con il tuo stile di vita.

🏠 Con Coabito puoi cercare alloggi e coinquilini in modo semplice, creando un profilo e trovando persone con esigenze e preferenze compatibili.

Se vuoi, posso spiegarti velocemente come funziona 😊

🌐 {{coabitoLink}}`,

  FOLLOW_UP_OWNER: `Ciao {{firstName}}! 👋

Ti scrivo nuovamente da Coabito per sapere se hai avuto modo di dare un'occhiata alla nostra piattaforma.

Se vuoi, posso spiegarti in 2 minuti come funziona e come possiamo aiutarti a trovare studenti compatibili per il tuo alloggio 😊

🌐 {{coabitoLink}}`,

  FOLLOW_UP_STUDENT: `Ciao {{firstName}}! 👋

Ti scrivo nuovamente da Coabito per sapere se hai avuto modo di dare un'occhiata alla nostra piattaforma.

Se vuoi, posso spiegarti in 2 minuti come funziona e come possiamo aiutarti 😊

🌐 {{coabitoLink}}`,
};

export function defaultAgentName(): string {
  return (process.env.NEXT_PUBLIC_AGENT_NAME || "Giovanni").trim() || "Giovanni";
}

export function defaultCoabitoLink(): string {
  return SITE_URL || "https://coabito.it";
}

/** Split "Nome Cognome" → first / last (best-effort). */
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

/**
 * Supporta:
 * - {{var}}
 * - {{#var}}…{{/var}} (incluso solo se var non vuota)
 */
export function interpolateTemplate(
  template: string,
  vars: WhatsAppTemplateVars,
): string {
  const map: Record<string, string> = {};
  for (const key of WHATSAPP_TEMPLATE_VARS) {
    map[key] = sanitizeVar(vars[key]);
  }

  let out = template;

  // Blocchi condizionali {{#key}}...{{/key}}
  out = out.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_m, key: string, inner: string) => (map[key] ? inner : ""),
  );

  // Placeholder semplici
  out = out.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => map[key] ?? "");

  // Rimuovi eventuali placeholder residui
  out = out.replace(/\{\{[^}]+\}\}/g, "");

  // Pulisci "Ciao !" → "Ciao!" se firstName mancava
  out = out.replace(/Ciao\s+!/g, "Ciao!");
  out = out.replace(/Ciao\s+,/g, "Ciao,");

  // Collassa linee vuote eccessive e trim
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
  };
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

  if (type === "CUSTOM") {
    return interpolateTemplate(
      customTemplate?.trim() ||
        `Ciao {{firstName}}!\n\nSono {{agentName}} di Coabito.\n\n🌐 {{coabitoLink}}`,
      vars,
    );
  }

  const base =
    templateOverrides?.[type]?.trim() ||
    DEFAULT_WHATSAPP_TEMPLATES[type] ||
    DEFAULT_WHATSAPP_TEMPLATES.OWNER;

  let message = interpolateTemplate(base, vars);

  // Sezione annuncio solo per studenti (e se c'è un link)
  if (
    (type === "STUDENT" || type === "FOLLOW_UP_STUDENT") &&
    vars.propertyLink
  ) {
    const block = interpolateTemplate(STUDENT_PROPERTY_BLOCK, vars);
    if (block && !message.includes(vars.propertyLink)) {
      message = `${message}\n\n${block}`;
    }
  }

  return message;
}

export function defaultTemplateForContact(
  contactType: WhatsAppContactKind,
  mode: "first" | "follow_up" | "custom",
): WhatsAppTemplateType {
  if (mode === "custom") return "CUSTOM";
  if (mode === "follow_up") {
    return contactType === "owner" ? "FOLLOW_UP_OWNER" : "FOLLOW_UP_STUDENT";
  }
  return contactType === "owner" ? "OWNER" : "STUDENT";
}

export function contactTypeLabel(kind: WhatsAppContactKind): string {
  return kind === "owner" ? "Proprietario" : "Studente";
}
