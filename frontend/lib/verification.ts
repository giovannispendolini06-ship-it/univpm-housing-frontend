/**
 * Domini email istituzionali accettati per il badge "studente verificato"
 * (prima città: UNIVPM / Ancona). Estendere quando Coabito apre altri atenei.
 */
export const INSTITUTIONAL_EMAIL_DOMAINS = [
  "studenti.univpm.it",
  "univpm.it",
] as const;

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";
export type VerificationMethod =
  | "institutional_email"
  | "document"
  | "ownership_document"
  | "manual_admin";

export function isInstitutionalEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  return INSTITUTIONAL_EMAIL_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

export function verificationLabel(
  status: VerificationStatus,
  role: "student" | "owner" | string,
): string {
  if (status !== "verified") return "";
  return role === "owner" ? "Proprietario verificato" : "Studente verificato";
}
