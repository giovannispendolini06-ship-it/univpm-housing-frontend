/**
 * Costruisce un link wa.me con messaggio precompilato. Chi lo apre vede
 * WhatsApp già pronto con il numero giusto e il testo scritto, pronto solo
 * da rivedere e inviare — non parte nulla in automatico.
 *
 * Ripulisce il numero da spazi/trattini/parentesi. Se non inizia già con
 * "+", assume un numero italiano e antepone +39 — assunzione ragionevole
 * per ora, dato che i proprietari sono tutti italiani; se in futuro
 * Coabito gestirà proprietari esteri, andrà rivista.
 */
export function buildWhatsAppLink(phone: string, message: string): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/[\s()-]/g, "");
  const withCountryCode = cleaned.startsWith("+") ? cleaned : `+39${cleaned.replace(/^0/, "")}`;
  const digitsOnly = withCountryCode.replace(/\D/g, "");

  if (digitsOnly.length < 8) return null;

  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
