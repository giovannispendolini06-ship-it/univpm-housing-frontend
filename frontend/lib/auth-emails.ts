/**
 * Auth transactional emails via Resend — never Supabase Auth SMTP.
 * Waitlist/other app mail stays in lib/email.ts (silent fail);
 * these helpers return a typed result so callers can handle failures.
 */
import { getResendClient, FROM_ADDRESS } from "@/lib/resend";

export type AuthEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const COLORS = {
  sea600: "#0F6E6A",
  sea100: "#CFE6E4",
  ink: "#0F2A2E",
  inkMuted: "#5C7A78",
  bg: "#F4F8F7",
  sunset500: "#FF6B4A",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ctaButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="border-radius:999px; background-color:${COLORS.sunset500};">
          <a href="${escapeHtml(href)}"
             style="display:inline-block; padding:14px 28px; color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; font-family: 'Source Sans 3', 'Source Sans Pro', Helvetica, Arial, sans-serif;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderLayout({
  preheader,
  title,
  body,
  ctaLabel,
  ctaUrl,
  footnote,
}: {
  preheader: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
}): string {
  return `
<!doctype html>
<html lang="it">
  <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family: 'Source Sans 3', 'Source Sans Pro', Helvetica, Arial, sans-serif;">
    <span style="display:none; font-size:1px; color:${COLORS.bg}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
      ${escapeHtml(preheader)}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 2px 10px rgba(15,42,46,0.08);">
            <tr>
              <td style="background-color:${COLORS.sea600}; padding:28px 32px;">
                <p style="margin:0; color:#ffffff; font-size:22px; font-weight:700; font-family: Fraunces, Georgia, 'Times New Roman', serif;">
                  Coabito
                </p>
                <p style="margin:12px 0 0; color:${COLORS.sea100}; font-size:13px; line-height:1.5;">
                  Trova casa chattando, non scorrendo annunci a caso.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
                <h1 style="margin:0 0 16px; font-size:20px; font-weight:700; color:${COLORS.ink}; font-family: Fraunces, Georgia, 'Times New Roman', serif;">
                  ${escapeHtml(title)}
                </h1>
                <p style="margin:0 0 8px; color:${COLORS.ink};">
                  ${body}
                </p>
                ${ctaButton(ctaLabel, ctaUrl)}
                <p style="margin:20px 0 0; color:${COLORS.inkMuted}; font-size:13px;">
                  ${escapeHtml(footnote)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:${COLORS.bg}; border-top:1px solid ${COLORS.sea100};">
                <p style="margin:0; font-size:12px; color:${COLORS.inkMuted}; line-height:1.6;">
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
</html>
  `.trim();
}

async function sendAuthEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<AuthEmailResult> {
  const to = input.to.trim();
  if (!to) return { ok: false, error: "missing_recipient" };

  const resend = getResendClient();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: input.subject,
      html: input.html,
    });
    if (error) {
      return { ok: false, error: error.message || "resend_send_failed" };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend_send_failed";
    return { ok: false, error: message };
  }
}

/** Conferma email (disponibile se in futuro serve un flusso DOI custom). */
export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string,
): Promise<AuthEmailResult> {
  return sendAuthEmail({
    to,
    subject: "Conferma il tuo account — Coabito",
    html: renderLayout({
      preheader: "Un click per attivare il tuo account",
      title: "Conferma il tuo account",
      body: "Grazie per esserti registrato su <strong>Coabito</strong>. Clicca il pulsante qui sotto per confermare la tua email e continuare.",
      ctaLabel: "Conferma email",
      ctaUrl: confirmUrl,
      footnote:
        "Se non hai creato tu un account, puoi ignorare questa email.",
    }),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<AuthEmailResult> {
  return sendAuthEmail({
    to,
    subject: "Reimposta la password — Coabito",
    html: renderLayout({
      preheader: "Link per scegliere una nuova password",
      title: "Reimposta la password",
      body: "Hai chiesto di reimpostare la password del tuo account <strong>Coabito</strong>. Clicca il pulsante qui sotto: il link scade tra poco.",
      ctaLabel: "Scegli una nuova password",
      ctaUrl: resetUrl,
      footnote:
        "Se non hai richiesto tu il reset, ignora questa email: la password resta invariata.",
    }),
  });
}

export async function sendMagicLinkEmail(
  to: string,
  magicUrl: string,
): Promise<AuthEmailResult> {
  return sendAuthEmail({
    to,
    subject: "Il tuo link di accesso — Coabito",
    html: renderLayout({
      preheader: "Accedi a Coabito con un click",
      title: "Accedi a Coabito",
      body: "Clicca il pulsante qui sotto per entrare nel tuo account. Il link è valido per poco tempo.",
      ctaLabel: "Accedi",
      ctaUrl: magicUrl,
      footnote:
        "Se non hai richiesto tu l’accesso, puoi ignorare questa email.",
    }),
  });
}
