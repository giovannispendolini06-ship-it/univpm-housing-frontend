/**
 * Template email CRM outreach (Resend).
 * Variabili: {{firstName}} {{lastName}} {{city}} {{propertyName}}
 * {{propertyLink}} {{coabitoLink}} {{agentName}} {{agencyName}}
 */

import { SITE_URL } from "@/lib/site";
import { interpolateTemplate, defaultAgentName } from "@/lib/whatsapp-templates";

export type CrmEmailTemplateKey =
  | "OWNER_FIRST_EMAIL"
  | "OWNER_FOLLOW_UP"
  | "AGENCY_FIRST_EMAIL"
  | "AGENCY_FOLLOW_UP"
  | "STUDENT_EMAIL"
  | "PROPERTY_ONBOARDING"
  | "PROPERTY_PUBLISHED";

export const CRM_EMAIL_TEMPLATE_KEYS: CrmEmailTemplateKey[] = [
  "OWNER_FIRST_EMAIL",
  "OWNER_FOLLOW_UP",
  "AGENCY_FIRST_EMAIL",
  "AGENCY_FOLLOW_UP",
  "STUDENT_EMAIL",
  "PROPERTY_ONBOARDING",
  "PROPERTY_PUBLISHED",
];

export const DEFAULT_CRM_EMAIL_TEMPLATES: Record<
  CrmEmailTemplateKey,
  { subject: string; body: string }
> = {
  OWNER_FIRST_EMAIL: {
    subject: "Dai più visibilità al tuo immobile con Coabito 🏠",
    body: `Ciao {{firstName}},

abbiamo visto il tuo annuncio e volevamo presentarti Coabito.

Coabito è una piattaforma che mette in contatto studenti e giovani in cerca di casa con proprietari e immobili.

Pubblicando il tuo immobile sul marketplace puoi raggiungere persone che stanno attivamente cercando una soluzione abitativa.

L'inserimento dell'immobile è semplice e gratuito.

👉 Scopri Coabito
{{coabitoLink}}

Se vuoi, possiamo aiutarti direttamente a inserire il tuo immobile.

A presto,
{{agentName}}
Coabito`,
  },
  OWNER_FOLLOW_UP: {
    subject: "Ancora un attimo su Coabito?",
    body: `Ciao {{firstName}},

ti scrivo nuovamente in merito a Coabito.

Se stai cercando un nuovo canale per dare visibilità al tuo immobile, possiamo aiutarti a inserirlo rapidamente nel marketplace.

{{coabitoLink}}

Se vuoi, posso mostrarti come funziona.

{{agentName}}
Coabito`,
  },
  AGENCY_FIRST_EMAIL: {
    subject: "Un nuovo canale per i vostri immobili dedicato agli studenti",
    body: `Buongiorno{{#firstName}} {{firstName}}{{/firstName}},

sono {{agentName}} di Coabito.

Stiamo sviluppando una piattaforma dedicata agli affitti per studenti e giovani, mettendo in contatto domanda abitativa e proprietari/agenzie.

Coabito può essere un canale aggiuntivo di visibilità per gli immobili di {{#agencyName}}{{agencyName}}{{/agencyName}}{{^agencyName}}la vostra agenzia{{/agencyName}}, raggiungendo studenti realmente in cerca.

Ci farebbe piacere presentarvi brevemente il progetto.

👉 {{coabitoLink}}

Se vi interessa, possiamo sentirci quando preferite.

Cordiali saluti,
{{agentName}}
Coabito`,
  },
  AGENCY_FOLLOW_UP: {
    subject: "Follow-up: collaborazione Coabito × agenzie",
    body: `Buongiorno{{#firstName}} {{firstName}}{{/firstName}},

riprendo contatto riguardo a Coabito — marketplace per affitti studenti.

Se per {{#agencyName}}{{agencyName}}{{/agencyName}}{{^agencyName}}la vostra agenzia{{/agencyName}} può essere utile un canale dedicato agli studenti, siamo disponibili a una call breve.

{{coabitoLink}}

A presto,
{{agentName}}`,
  },
  STUDENT_EMAIL: {
    subject: "Trova casa e coinquilini con Coabito",
    body: `Ciao {{firstName}},

Coabito ti aiuta a trovare casa e coinquilini compatibili in modo semplice.

Crea un profilo, esplora gli immobili e ricevi match in base alle tue preferenze.

{{coabitoLink}}

A presto,
{{agentName}}
Coabito`,
  },
  PROPERTY_ONBOARDING: {
    subject: "Completa l'inserimento del tuo immobile su Coabito",
    body: `Ciao {{firstName}},

sei a un passo dal pubblicare{{#propertyName}} «{{propertyName}}»{{/propertyName}} su Coabito.

Completa l'onboarding qui:
{{propertyLink}}

{{agentName}}
Coabito`,
  },
  PROPERTY_PUBLISHED: {
    subject: "Il tuo immobile è online su Coabito 🏠",
    body: `Ciao {{firstName}},

ottima notizia:{{#propertyName}} «{{propertyName}}»{{/propertyName}} è pubblicato sul marketplace Coabito.

{{propertyLink}}

Gli studenti interessati potranno contattarti tramite la piattaforma.

{{agentName}}
Coabito`,
  },
};

/** Supporta anche {{^var}}…{{/var}} (inverso di #). */
export function interpolateEmailTemplate(
  template: string,
  vars: Record<string, string | null | undefined>,
): string {
  let out = template;
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    const s = (v ?? "").toString().trim();
    map[k] = !s || s === "undefined" || s === "null" ? "" : s;
  }

  out = out.replace(
    /\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_m, key: string, inner: string) => (!map[key] ? inner : ""),
  );
  out = interpolateTemplate(out, map as never);
  return out;
}

export function buildCrmEmail(
  key: CrmEmailTemplateKey,
  vars: Record<string, string | null | undefined>,
  overrides?: Partial<Record<CrmEmailTemplateKey, { subject: string; body: string }>>,
): { subject: string; body: string } {
  const base = overrides?.[key] ?? DEFAULT_CRM_EMAIL_TEMPLATES[key];
  const resolved = {
    coabitoLink: vars.coabitoLink || SITE_URL,
    agentName: vars.agentName || defaultAgentName(),
    ...vars,
  };
  return {
    subject: interpolateEmailTemplate(base.subject, resolved),
    body: interpolateEmailTemplate(base.body, resolved),
  };
}

export function plainTextToEmailHtml(text: string, unsubscribeUrl?: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  const unsub = unsubscribeUrl
    ? `<p style="margin-top:24px;font-size:12px;color:#5C7A78;">Se non vuoi più ricevere queste email, <a href="${unsubscribeUrl}" style="color:#0F6E6A;">disiscriviti qui</a>.</p>`
    : "";

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F2A2E;font-size:15px;line-height:1.55;">${escaped}${unsub}</div>`;
}
