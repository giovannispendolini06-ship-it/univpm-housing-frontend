/**
 * Domini email istituzionali accettati per il badge "studente verificato"
 * (prima città: UNIVPM / Ancona). Estendere quando Coabito apre altri atenei.
 */
export const INSTITUTIONAL_EMAIL_DOMAINS = [
  "studenti.univpm.it",
  "univpm.it",
] as const;

/** Free / consumer mail domains — not accepted as corporate email trust signal. */
export const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.it",
  "yahoo.com",
  "yahoo.it",
  "outlook.com",
  "outlook.it",
  "live.com",
  "live.it",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "libero.it",
  "alice.it",
] as const;

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";
export type VerificationMethod =
  | "institutional_email"
  | "document"
  | "ownership_document"
  | "manual_admin"
  | "corporate_email"
  | "employer_declaration";

export function isInstitutionalEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  return INSTITUTIONAL_EMAIL_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

/**
 * Soft corporate-email heuristic: reject known free-mail domains.
 * Does not prove employment — optional trust signal only.
 */
export function looksLikeCorporateEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  if (!domain || !domain.includes(".")) return false;
  return !FREE_EMAIL_DOMAINS.some(
    (free) => domain === free || domain.endsWith(`.${free}`),
  );
}

export function verificationLabel(
  status: VerificationStatus,
  role: "student" | "worker" | "owner" | string,
): string {
  if (status !== "verified") return "";
  if (role === "owner") return "Proprietario verificato";
  if (role === "worker") return "Lavoratore verificato";
  return "Studente verificato";
}
