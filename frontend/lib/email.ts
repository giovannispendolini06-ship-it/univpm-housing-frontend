// lib/email.ts
import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Finché non hai un dominio verificato, le email partono da questo
// indirizzo di test di Resend — funziona subito, senza configurazione.
// Quando avrai un dominio tuo: 1) verificalo su resend.com/domains,
// 2) aggiorna questa riga con qualcosa tipo "Coabito <info@tuodominio.it>".
const FROM_ADDRESS = "Coabito <onboarding@resend.dev>";

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

const LAYOUT_COPY: Record<
  EmailLocale,
  { tagline: string; footer: string; questionsLabel: string }
> = {
  it: {
    tagline: "Trova casa chattando, non scorrendo annunci a caso.",
    footer:
      "Coabito aiuta chi studia fuori sede a trovare casa vicino al proprio ateneo, e i proprietari ad affittare senza perdite di tempo.",
    questionsLabel: "Domande? Scrivici a",
  },
  en: {
    tagline: "Find a home by chatting, not by scrolling random listings.",
    footer:
      "Coabito helps out-of-town students find housing near their university, and helps landlords rent without wasting time.",
    questionsLabel: "Questions? Email us at",
  },
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
  const copy = LAYOUT_COPY[locale];

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
                  ${copy.tagline}
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
                  ${copy.footer}<br />
                  ${copy.questionsLabel}
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

function formatPeriodMonth(periodMonth: string, locale: EmailLocale): string {
  const date = new Date(periodMonth);
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", {
    month: "long",
    year: "numeric",
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://univpm-housing-frontend.vercel.app";

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
      <strong>24-48 ore</strong> per parlare del tuo immobile e di come
      affittarlo a studenti già verificati, senza che tu debba gestire
      trattative infinite.
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
          ? "Il tuo profilo è pronto. Da qui in poi ci pensiamo noi a trovarti inquilini seri: filtriamo gli studenti compatibili, tu decidi solo con chi firmare."
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

// ----------------------------------------------------------------------------
// Email 4: nuova stanza compatibile (notifica proattiva Vesta)
// ----------------------------------------------------------------------------
export function buildNewRoomMatchEmail(input: {
  fullName: string;
  roomLabel: string;
  zone?: string | null;
  priceMonthly: number;
  matchScore: number;
  locale: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";
  const zonePart =
    input.zone && locale === "it"
      ? ` a ${input.zone}`
      : input.zone && locale === "en"
        ? ` in ${input.zone}`
        : "";

  const bodyHtml =
    locale === "en"
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
    subject:
      locale === "en"
        ? `New compatible room: ${input.roomLabel}`
        : `Nuova stanza compatibile: ${input.roomLabel}`,
    html: renderEmailLayout({
      preheader:
        locale === "en"
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
  checklist: string[];
  locale: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";

  const bodyHtml =
    locale === "en"
      ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Welcome to your new home, ${input.fullName}! 🎉
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Your tenancy for <strong>${input.roomLabel}</strong> at ${input.address} is confirmed.
      Here is a personalised move-in checklist to help you get started:
    </p>
    ${checklistHtml(input.checklist)}
    <p style="margin:16px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      You can also find this checklist in the "My home" section of your dashboard.
    </p>
    ${ctaButton("Go to my dashboard", `${SITE_URL}/dashboard`)}
  `
      : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Benvenuto/a nella tua nuova casa, ${input.fullName}! 🎉
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Il tuo affitto per <strong>${input.roomLabel}</strong> in ${input.address} è confermato.
      Ecco una checklist di trasloco personalizzata per iniziare al meglio:
    </p>
    ${checklistHtml(input.checklist)}
    <p style="margin:16px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
      Trovi la stessa checklist anche nella sezione "La mia casa" della tua area personale.
    </p>
    ${ctaButton("Vai alla tua area", `${SITE_URL}/dashboard`)}
  `;

  return {
    subject: locale === "en" ? "Your move-in checklist is ready" : "La tua checklist di trasloco è pronta",
    html: renderEmailLayout({
      preheader:
        locale === "en"
          ? `Everything you need before moving into ${input.roomLabel}`
          : `Tutto quello che ti serve prima di traslocare in ${input.roomLabel}`,
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
  roomLabel: string;
  amountDue: number;
  periodMonth: string;
  locale: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";
  const monthLabel = formatPeriodMonth(input.periodMonth, locale);
  const amountFormatted =
    locale === "en"
      ? `€${input.amountDue}`
      : `${input.amountDue.toLocaleString("it-IT")}€`;

  const bodyHtml =
    locale === "en"
      ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Hi ${input.fullName}, your rent is overdue
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      We haven't recorded your rent payment for <strong>${monthLabel}</strong>
      for <strong>${input.roomLabel}</strong> (${amountFormatted}).
    </p>
    <p style="margin:0 0 16px; color:${COLORS.inkMuted};">
      If you've already paid, please get in touch so we can update your record.
      Otherwise, please arrange payment as soon as possible.
    </p>
    ${ctaButton("View my home", `${SITE_URL}/dashboard`)}
  `
      : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Ciao ${input.fullName}, il tuo affitto risulta in ritardo
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Non abbiamo ancora registrato il pagamento dell'affitto di <strong>${monthLabel}</strong>
      per <strong>${input.roomLabel}</strong> (${amountFormatted}).
    </p>
    <p style="margin:0 0 16px; color:${COLORS.inkMuted};">
      Se hai già pagato, scrivici così aggiorniamo la situazione.
      Altrimenti, ti chiediamo di provvedere al pagamento il prima possibile.
    </p>
    ${ctaButton("Vai alla mia casa", `${SITE_URL}/dashboard`)}
  `;

  return {
    subject:
      locale === "en"
        ? `Rent overdue — ${monthLabel}`
        : `Affitto in ritardo — ${monthLabel}`,
    html: renderEmailLayout({
      preheader:
        locale === "en"
          ? `Your rent for ${monthLabel} has not been recorded yet`
          : `Il pagamento dell'affitto di ${monthLabel} non risulta ancora registrato`,
      bodyHtml,
      locale,
    }),
  };
}

// ----------------------------------------------------------------------------
// Email 7: conferma pagamento ricevuto
// ----------------------------------------------------------------------------
export function buildPaymentConfirmedEmail(input: {
  fullName: string;
  roomLabel: string;
  amountDue: number;
  periodMonth: string;
  locale: EmailLocale;
}) {
  const locale = input.locale === "en" ? "en" : "it";
  const monthLabel = formatPeriodMonth(input.periodMonth, locale);
  const amountFormatted =
    locale === "en"
      ? `€${input.amountDue}`
      : `${input.amountDue.toLocaleString("it-IT")}€`;

  const bodyHtml =
    locale === "en"
      ? `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Payment received — thank you, ${input.fullName}! ✓
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      We've recorded your rent payment of <strong>${amountFormatted}</strong> for
      <strong>${monthLabel}</strong> for <strong>${input.roomLabel}</strong>.
    </p>
    <p style="margin:0; color:${COLORS.inkMuted}; font-size:13px;">
      You can check the status anytime in the "My home" section of your dashboard.
    </p>
    ${ctaButton("View my home", `${SITE_URL}/dashboard`)}
  `
      : `
    <h1 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:${COLORS.ink};">
      Pagamento ricevuto — grazie, ${input.fullName}! ✓
    </h1>
    <p style="margin:0 0 16px; color:${COLORS.ink};">
      Abbiamo registrato il tuo pagamento di <strong>${amountFormatted}</strong> per
      <strong>${monthLabel}</strong> relativo a <strong>${input.roomLabel}</strong>.
    </p>
    <p style="margin:0; color:${COLORS.inkMuted}; font-size:13px;">
      Puoi controllare lo stato in qualsiasi momento nella sezione "La mia casa" della tua area.
    </p>
    ${ctaButton("Vai alla mia casa", `${SITE_URL}/dashboard`)}
  `;

  return {
    subject:
      locale === "en"
        ? `Payment confirmed — ${monthLabel}`
        : `Pagamento confermato — ${monthLabel}`,
    html: renderEmailLayout({
      preheader:
        locale === "en"
          ? `Your rent for ${monthLabel} has been recorded`
          : `Il tuo affitto di ${monthLabel} risulta pagato`,
      bodyHtml,
      locale,
    }),
  };
}
