/**
 * Shared Resend client for transactional mail (waitlist via lib/email.ts,
 * auth via lib/auth-emails.ts). Never import this from client components.
 */
import { Resend } from "resend";

export const FROM_ADDRESS =
  process.env.RESEND_FROM?.trim() || "Coabito <info@coabito.it>";

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}
