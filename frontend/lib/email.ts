// lib/email.ts
import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Dominio coabito.it verificato su Resend: tutte le email transazionali
// partono da info@coabito.it (lista d'attesa, benvenuto, pagamenti, ecc.).
const FROM_ADDRESS = "Coabito <info@coabito.it>";

type EmailLocale = "it" | "en";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Invia un'email. Non lancia MAI un errore che possa bloccare il resto
 * del flusso (es. il salvataggio di un form): se manca la chiave API o
 * l'invio fallisce, lo logghiamo soltanto e andiamo avanti.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!to) return;

  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY non impostata: email non inviata.", { to, subject });
    return;
  }

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (err) {
    console.error("[email] Errore nell'invio:", err);
  }
}

// ============================================================================
// TEMPLATE BRANDIZZATO
// Stessi colori/font del sito (tema "Adriatico": teal profondo + corallo),
// con la mission richiamata subito sotto il logo in ogni email — così anche
// chi legge solo l'email capisce cos'è Coabito, non solo chi visita il sito.
// ============================================================================

const COLORS = {
  sea600: "#0F6E6A",
  sea100: "#CFE6E4",
  sea50: "#EAF4F3",
  ink: "#0F2A2E",
  inkMuted: "#5C7A78",
  bg: "#F4F8F7",
  sunset500: "#FF6B4A",
};

function renderEmailLayout({
  preheader,
  bodyHtml,
  locale = "it",
}: {
  preheader: string;
  bodyHtml: string;
  locale?: EmailLocale;
}): string {
  const isEn = locale === "en";

  return `
<!doctype html>
<html lang="${locale}">
  <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <span style="display:none; font-size:1px; color:${COLORS.bg}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
      ${preheader}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 2px 10px rgba(15,42,46,0.08);">

            <!-- Header con logo e mission -->
            <tr>
              <td style="background-color:${COLORS.sea600}; padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px; height:36px; background-color:#ffffff; border-radius:50%; text-align:center; vertical-align:middle; font-weight:bold; color:${COLORS.sea600}; font-size:16px; font-family: Georgia, serif;">
                      C
                    </td>
                    <td style="padding-left:10px; color:#ffffff; font-size:19px; font-weight:bold;">
                      Coabito
                    </td>
                  </tr>
                </table>
                <p style="margin:14px 0 0; color:${COLORS.sea100}; font-size:13px; line-height:1.5;">
                  ${isEn
                    ? "Find a home by chatting, not by scrolling random listings."
                    : "Trova casa chattando, non scorrendo annunci a caso."}
                </p>
              </td>
            </tr>

            <!-- Corpo dell'email -->
            <tr>
              <td style="padding:32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px; background-color:${COLORS.bg}; border-top:1px solid ${COLORS.sea100};">
                <p style="margin:0; font-size:12px; color:${COLORS.inkMuted}; line-height:1.6;">
                  ${isEn
                    ? "Coabito helps out-of-town students find housing near their university, and helps landlords rent without wasting time."
                    : "Coabito aiuta chi studia fuori sede a trovare casa vicino al proprio ateneo, e i proprietari ad affittare senza perdite di tempo."}<br />
                  ${isEn ? "Questions? Email us at" : "Domande? Scrivici a"}
                  <a href="mailto:info@coabito.it" style="color:${COLORS.sea600};">info@coabito.it</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block; background-color:${COLORS.sunset500}; color:#ffffff; text-decoration:none; padding:12px 26px; border-radius:999px; font-size:14px; font-weight:600; margin-top:8px;">
      ${label}
    </a>`;
}

function checklistHtml(items: string[]): string {
  if (items.length === 0) return "";
  const listItems = items.map((item) => `<li style="margin:0 0 8px;">${item}</li>`).join("");
  return `<ul style="margin:12px 0 0; padding-left:20px; color:${COLORS.ink};">${listItems}</ul>`;
}

// ----------------------------------------------------------------------------
// Email 1: a te, quando arriva una nuova richiesta dal form proprietari
// ----------------------------------------------------------------------------
export function buildAdminInquiryEmail(input: {
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  message: string;
}) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Nuova richiesta proprietario 🏠
    </h1>
    <p style="margin:0 0 20px; color:${COLORS.inkMuted};">
      Qualcuno ha compilato il form "Proponi il tuo immobile" sul sito.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sea50}; border-radius:12px; padding:4px;">
      <tr><td style="padding:12px 16px;"><strong>Nome:</strong> ${input.fullName}</td></tr>
      <tr><td style="padding:0 16px 12px;"><strong>Telefono:</strong> <a href="tel:${input.phone}" style="color:${COLORS.sea600};">${input.phone}</a></td></tr>
      <tr><td style="padding:0 16px 12px;"><strong>Email:</strong> ${input.email || "non fornita"}</td></tr>
      <tr><td style="padding:0 16px 12px;"><strong>Indirizzo:</strong> ${input.propertyAddress || "non fornito"}</td></tr>
      <tr><td style="padding:0 16px 16px;"><strong>Messaggio:</strong> ${input.message || "—"}</td></tr>
    </table>
    ${ctaButton("Vai alle richieste", `${SITE_URL}/admin/inquiries`)}
  `;

  return {
    subject: `Nuova richiesta proprietario: ${input.fullName}`,
    html: renderEmailLayout({
      preheader: `${input.fullName} ha proposto un immobile su Coabito`,
      bodyHtml,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email: a te, quando qualcuno si iscrive alla lista d'attesa (form o Vesta)
// ----------------------------------------------------------------------------
const WAITLIST_SOURCE_BADGE: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  lista_attesa: { label: "Lista d'attesa", bg: COLORS.sea50, color: COLORS.sea600 },
  vesta_chat: { label: "Chat Vesta", bg: "#FFE8E2", color: COLORS.sunset500 },
  instagram: { label: "Instagram", bg: COLORS.sea50, color: COLORS.sea600 },
  whatsapp: { label: "WhatsApp", bg: COLORS.sea50, color: COLORS.sea600 },
  telegram: { label: "Telegram", bg: COLORS.sea50, color: COLORS.sea600 },
};

const WAITLIST_POLO_LABELS: Record<string, string> = {
  monte_dago: "Monte Dago / Tavernelle",
  torrette: "Torrette",
  centro_economia_giurisprudenza: "Centro / Villarey",
  altro: "Altro",
};

const WAITLIST_FACOLTA_LABELS: Record<string, string> = {
  ingegneria_informatica: "Ingegneria informatica",
  ingegneria_civile: "Ingegneria civile",
  medicina: "Medicina",
  economia: "Economia",
  giurisprudenza: "Giurisprudenza",
  agraria: "Agraria",
  scienze: "Scienze",
  design: "Design",
  altro: "Altro",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAdminWaitlistEmail(input: {
  nome: string;
  email: string | null;
  phone: string | null;
  facolta: string | null;
  polo: string | null;
  budget: number | null;
  source: string;
  /** true = in attesa di click sul link di conferma email */
  pendingConfirmation?: boolean;
}) {
  const badge =
    WAITLIST_SOURCE_BADGE[input.source] ??
    ({ label: input.source || "Altro", bg: COLORS.sea50, color: COLORS.sea600 } as const);

  const facoltaLabel = input.facolta
    ? (WAITLIST_FACOLTA_LABELS[input.facolta] ?? input.facolta)
    : "—";
  const poloLabel = input.polo
    ? (WAITLIST_POLO_LABELS[input.polo] ?? input.polo)
    : "—";
  const budgetLabel =
    input.budget !== null && input.budget !== undefined ? `${input.budget}€/mese` : "—";

  const emailCell = input.email
    ? `<a href="mailto:${escapeHtml(input.email)}" style="color:${COLORS.sea600};">${escapeHtml(input.email)}</a>`
    : "—";
  const phoneCell = input.phone
    ? `<a href="tel:${escapeHtml(input.phone)}" style="color:${COLORS.sea600};">${escapeHtml(input.phone)}</a>`
    : "—";

  const row = (label: string, valueHtml: string, isLast = false) => `
    <tr>
      <td style="padding:${isLast ? "10px 16px 14px" : "10px 16px 0"}; width:38%; vertical-align:top; font-size:12px; font-weight:600; color:${COLORS.inkMuted}; text-transform:uppercase; letter-spacing:0.03em;">
        ${label}
      </td>
      <td style="padding:${isLast ? "10px 16px 14px" : "10px 16px 0"}; vertical-align:top; font-size:15px; color:${COLORS.ink}; font-weight:500;">
        ${valueHtml}
      </td>
    </tr>`;

  const pendingNote = input.pendingConfirmation
    ? `<p style="margin:0 0 16px; padding:10px 14px; background-color:#FFF6E8; border-radius:10px; color:${COLORS.inkMuted}; font-size:13px;">
        In attesa di conferma email (double opt-in). Non inviare comunicazioni marketing finché non conferma.
      </p>`
    : "";

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      <tr>
        <td>
          <span style="display:inline-block; background-color:${badge.bg}; color:${badge.color}; font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; padding:5px 10px; border-radius:999px;">
            ${escapeHtml(badge.label)}
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 8px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Nuova iscrizione 🎯
    </h1>
    <p style="margin:0 0 20px; color:${COLORS.inkMuted}; font-size:14px;">
      <strong style="color:${COLORS.ink};">${escapeHtml(input.nome)}</strong> è entrato/a in lista d'attesa.
    </p>
    ${pendingNote}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sea50}; border-radius:12px; overflow:hidden;">
      ${row("Nome", escapeHtml(input.nome))}
      ${row("Email", emailCell)}
      ${row("Telefono", phoneCell)}
      ${row("Facoltà", escapeHtml(facoltaLabel))}
      ${row("Polo", escapeHtml(poloLabel))}
      ${row("Budget", escapeHtml(budgetLabel), true)}
    </table>

    ${ctaButton("Apri la lista d'attesa", `${SITE_URL}/admin/waitlist`)}
  `;

  return {
    subject: `[Coabito] Nuova iscrizione lista d'attesa — ${input.nome}`,
    html: renderEmailLayout({
      preheader: `${input.nome} · ${badge.label} · ${poloLabel}`,
      bodyHtml,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email: double opt-in — conferma iscrizione lista d'attesa
// ----------------------------------------------------------------------------
export function buildWaitlistConfirmEmail(input: {
  nome: string;
  confirmUrl: string;
  locale?: EmailLocale;
}) {
  const locale = input.locale ?? "it";
  const isEn = locale === "en";
  const firstName = escapeHtml(input.nome.split(/\s+/)[0] || input.nome);

  const bodyHtml = isEn
    ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Confirm your waitlist signup, ${firstName}
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Thanks for joining the <strong>Coabito</strong> waitlist. Click the button below to confirm your email — we'll only notify you about compatible rooms after that.
    </p>
    ${ctaButton("Confirm my email", input.confirmUrl)}
    <p style="margin:20px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      This link expires in 7 days. If you didn't sign up, you can ignore this email.
    </p>
  `
    : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Conferma la tua iscrizione, ${firstName}
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Grazie per esserti iscritto/a alla lista d'attesa di <strong>Coabito</strong>. Clicca il pulsante qui sotto per confermare la tua email: ti avviseremo di stanze compatibili solo dopo questa conferma.
    </p>
    ${ctaButton("Conferma la mia email", input.confirmUrl)}
    <p style="margin:20px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      Questo link scade tra 7 giorni. Se non ti sei iscritto/a tu, ignora pure questa email.
    </p>
  `;

  return {
    subject: isEn
      ? "Confirm your Coabito waitlist signup"
      : "Conferma la tua iscrizione alla lista d'attesa Coabito",
    html: renderEmailLayout({
      preheader: isEn
        ? "One click to confirm your waitlist signup"
        : "Un click per confermare la tua iscrizione alla lista d'attesa",
      bodyHtml,
      locale,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 2: conferma di ricezione a chi ha compilato il form proprietari
// ----------------------------------------------------------------------------
export function buildInquiryConfirmationEmail(input: { fullName: string }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Ciao ${input.fullName}, ci siamo! 👋
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Grazie per aver proposto il tuo immobile su <strong>Coabito</strong>. Lo
      abbiamo ricevuto e lo stiamo già guardando.
    </p>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      La nostra promessa: niente perditempo. Ti ricontattiamo entro
      <strong>24-48 ore</strong> per parlarti del marketplace Coabito:
      matching con studenti compatibili (e, appena disponibili, verificati),
      tu firmi direttamente con chi scegli — noi restiamo fuori dal contratto
      e lavoriamo su fiducia e sicurezza della transazione.
    </p>
    <p style="margin:0; color:${COLORS.inkMuted}; font-size:13px;">
      Nel frattempo, se hai domande, rispondi pure a questa email.
    </p>
  `;

  return {
    subject: "Abbiamo ricevuto la tua richiesta",
    html: renderEmailLayout({
      preheader: "Grazie per aver proposto il tuo immobile su Coabito",
      bodyHtml,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 3: benvenuto, dopo aver completato la registrazione
// ----------------------------------------------------------------------------
export function buildWelcomeEmail(input: { fullName: string; role: "student" | "owner" }) {
  const isOwner = input.role === "owner";

  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Benvenuto${isOwner ? "" : "/a"} su Coabito, ${input.fullName}! 🎉
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      ${
        isOwner
          ? "Il tuo profilo è pronto. Da qui in poi filtriamo gli studenti compatibili: tu decidi con chi firmare direttamente. Il contratto resta tra te e lo studente — Coabito è il marketplace di matching e fiducia."
          : "Il tuo profilo è pronto. Vesta, il nostro assistente, ti aspetta per capire facoltà, budget e abitudini — e proporti solo le stanze davvero compatibili con te, non l'ennesimo annuncio a caso."
      }
    </p>
    ${ctaButton(isOwner ? "Vai alla tua area" : "Inizia a chattare con Vesta", `${SITE_URL}/${isOwner ? "owner" : "dashboard"}`)}
  `;

  return {
    subject: "Benvenuto su Coabito! 🎉",
    html: renderEmailLayout({
      preheader: "Il tuo profilo è pronto",
      bodyHtml,
    }),
  };
}

export function buildApplicationStatusEmail(input: {
  fullName: string;
  statusLabel: string;
}) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Aggiornamento candidatura
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Ciao ${input.fullName || ""}, la tua candidatura è stata segnata come
      <strong>${input.statusLabel}</strong>.
    </p>
    <p style="margin:0 0 16px; color:${COLORS.inkMuted}; font-size:13px;">
      Il contratto di locazione, se si procede, resta diretto tra te e il proprietario.
      Coabito resta il marketplace di matching e fiducia.
    </p>
    ${ctaButton("Vedi le tue candidature", `${SITE_URL}/applications`)}
  `;

  return {
    subject: `Candidatura ${input.statusLabel} — Coabito`,
    html: renderEmailLayout({
      preheader: `La tua candidatura è ${input.statusLabel}`,
      bodyHtml,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 4: nuova stanza compatibile (notifica proattiva Vesta)
// ----------------------------------------------------------------------------
export function buildNewRoomMatchEmail(input: {
  fullName: string;
  roomLabel: string;
  zone?: string | null;
  priceMonthly: number;
  matchScore: number;
  locale?: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";
  const isEn = locale === "en";
  const zonePart =
    input.zone && isEn
      ? ` in ${input.zone}`
      : input.zone
        ? ` a ${input.zone}`
        : "";

  const bodyHtml = isEn
    ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Hi ${input.fullName}, a new room for you! 🏠
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Vesta found a new room that might interest you:
      <strong>${input.roomLabel}</strong>${zonePart}, €${input.priceMonthly}/month,
      <strong>${input.matchScore}%</strong> compatibility.
    </p>
    <p style="margin:0 0 16px; color:${COLORS.inkMuted};">
      Open your dashboard to see the suggested rooms and chat with Vesta for more details.
    </p>
    ${ctaButton("View suggested rooms", `${SITE_URL}/dashboard`)}
  `
    : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Ciao ${input.fullName}, una stanza nuova per te! 🏠
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Vesta ha trovato una stanza nuova che potrebbe interessarti:
      <strong>${input.roomLabel}</strong>${zonePart}, ${input.priceMonthly}€/mese,
      compatibilità <strong>${input.matchScore}%</strong>.
    </p>
    <p style="margin:0 0 16px; color:${COLORS.inkMuted};">
      Apri la tua area per vedere le stanze proposte e chatta con Vesta per i dettagli.
    </p>
    ${ctaButton("Vedi le stanze proposte", `${SITE_URL}/dashboard`)}
  `;

  return {
    subject: isEn
      ? "A new compatible room, just for you"
      : "Una stanza nuova compatibile, solo per te",
    html: renderEmailLayout({
      preheader: isEn
        ? `A new room with ${input.matchScore}% compatibility is waiting for you`
        : `Una nuova stanza con compatibilità ${input.matchScore}% ti aspetta`,
      bodyHtml,
      locale,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 5: trasloco — checklist personalizzata dopo la registrazione affitto
// ----------------------------------------------------------------------------
export function buildMoveInEmail(input: {
  fullName: string;
  roomLabel: string;
  address: string;
  startedAt: string;
  checklist: string[] | null;
  locale?: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";
  const isEn = locale === "en";
  const startedAtLabel = new Date(input.startedAt).toLocaleDateString(
    isEn ? "en-GB" : "it-IT",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const checklistSection =
    input.checklist && input.checklist.length > 0
      ? isEn
        ? `<p style="margin:0 0 16px; color:${COLORS.ink};">Here is a personalised move-in checklist to help you get started:</p>${checklistHtml(input.checklist)}`
        : `<p style="margin:0 0 16px; color:${COLORS.ink};">Ecco una checklist di trasloco personalizzata per iniziare al meglio:</p>${checklistHtml(input.checklist)}`
      : "";

  const bodyHtml = isEn
    ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Welcome home, ${input.fullName}! 🏠
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Your tenancy for <strong>${input.roomLabel}</strong> at ${input.address} starts on
      <strong>${startedAtLabel}</strong>.
    </p>
    ${checklistSection}
    <p style="margin:16px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      You can also find your tenancy details in the "My home" section of your dashboard.
    </p>
    ${ctaButton("Go to my dashboard", `${SITE_URL}/dashboard`)}
  `
    : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Benvenuto/a a casa, ${input.fullName}! 🏠
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Il tuo affitto per <strong>${input.roomLabel}</strong> in ${input.address} inizia il
      <strong>${startedAtLabel}</strong>.
    </p>
    ${checklistSection}
    <p style="margin:16px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      Trovi i dettagli del tuo affitto anche nella sezione "La mia casa" della tua area personale.
    </p>
    ${ctaButton("Vai alla tua area", `${SITE_URL}/dashboard`)}
  `;

  return {
    subject: isEn ? "Welcome home! 🏠" : "Benvenuto a casa! 🏠",
    html: renderEmailLayout({
      preheader: isEn
        ? `Your tenancy at ${input.address} starts on ${startedAtLabel}`
        : `Il tuo affitto in ${input.address} inizia il ${startedAtLabel}`,
      bodyHtml,
      locale,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 6: promemoria affitto in ritardo
// ----------------------------------------------------------------------------
export function buildPaymentLateEmail(input: {
  fullName: string;
  amountDue: number;
  periodLabel: string;
  locale?: "it" | "en";
}) {
  const locale = input.locale ?? "it";
  const isEn = locale === "en";

  const bodyHtml = isEn
    ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Hi ${input.fullName}, a quick reminder
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      We haven't received your payment of <strong>${input.amountDue}€</strong> for
      <strong>${input.periodLabel}</strong> yet. If you've already sent it, just ignore this —
      it can take a couple of days to show up. Otherwise, could you take care of it when you get a chance?
    </p>
    <p style="margin:0; color:${COLORS.inkMuted}; font-size:13px;">
      Questions about the payment? Just reply to this email.
    </p>
  `
    : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Ciao ${input.fullName}, un promemoria veloce
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Non ci risulta ancora arrivato il pagamento di <strong>${input.amountDue}€</strong> per
      <strong>${input.periodLabel}</strong>. Se l'hai già inviato, ignora pure questo messaggio —
      a volte ci vuole qualche giorno perché risulti. Altrimenti, puoi occupartene quando hai un attimo?
    </p>
    <p style="margin:0; color:${COLORS.inkMuted}; font-size:13px;">
      Domande sul pagamento? Rispondi pure a questa email.
    </p>
  `;

  return {
    subject: isEn ? "Payment reminder" : "Promemoria pagamento",
    html: renderEmailLayout({
      preheader: isEn ? "A quick reminder about your rent" : "Un promemoria veloce sull'affitto",
      bodyHtml,
      locale,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 7: a uno studente, conferma di un pagamento ricevuto
// ----------------------------------------------------------------------------
export function buildPaymentConfirmedEmail(input: {
  fullName: string;
  amountDue: number;
  periodLabel: string;
  locale?: "it" | "en";
}) {
  const locale = input.locale ?? "it";
  const isEn = locale === "en";

  const bodyHtml = isEn
    ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Thanks, ${input.fullName}! ✓
    </h1>
    <p style="margin:0; color:${COLORS.ink};">
      We've marked your payment of <strong>${input.amountDue}€</strong> for
      <strong>${input.periodLabel}</strong> as received. Nothing else to do — see you next month.
    </p>
  `
    : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Grazie, ${input.fullName}! ✓
    </h1>
    <p style="margin:0; color:${COLORS.ink};">
      Abbiamo segnato come ricevuto il tuo pagamento di <strong>${input.amountDue}€</strong> per
      <strong>${input.periodLabel}</strong>. Nessun'altra azione da fare — ci vediamo il mese prossimo.
    </p>
  `;

  return {
    subject: isEn ? "Payment received, thank you" : "Pagamento ricevuto, grazie",
    html: renderEmailLayout({
      preheader: isEn ? "Your payment has been confirmed" : "Il tuo pagamento è stato confermato",
      bodyHtml,
      locale,
    }),
  };
}
