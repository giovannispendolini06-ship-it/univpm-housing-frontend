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
}: {
  preheader: string;
  bodyHtml: string;
}): string {
  return `
<!doctype html>
<html lang="it">
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
                  Trova casa chattando, non scorrendo annunci a caso.
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
                  Coabito aiuta chi studia fuori sede a trovare casa vicino al
                  proprio ateneo, e i proprietari ad affittare senza perdite
                  di tempo.<br />
                  Domande? Scrivici a
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
          : "Il tuo profilo è pronto. Vesta, la nostra assistente, ti aspetta per capire facoltà, budget e abitudini — e proporti solo le stanze davvero compatibili con te, non l'ennesimo annuncio a caso."
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
