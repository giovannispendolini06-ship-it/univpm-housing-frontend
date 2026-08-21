/**
 * Costruisce un link wa.me con messaggio precompilato. Chi lo apre vede
 * WhatsApp già pronto con il numero giusto e il testo scritto, pronto solo
 * da rivedere e inviare — non parte nulla in automatico.
 *
 * Formato consigliato per NEXT_PUBLIC_WHATSAPP_NUMBER:
 *   393758222238
 * (internazionale, senza + né spazi)
 *
 * Accetta anche: +393758222238, 3758222238, 03758222238
 *
 * Importante: se il numero include già il prefisso paese 39, NON ne
 * antepone un altro (prima produceva 39393758222238 → “numero inesistente”).
 */

/** Solo cifre E.164 senza `+`, o null se inutilizzabile. */
export function normalizeWhatsAppDigits(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  // Già internazionale IT: 39 + 9–10 cifre nazionali (es. 393758222238)
  if (/^39\d{9,10}$/.test(digits)) {
    return digits;
  }

  // Altro prefisso paese già presente (11–15 cifre, non inizia con 0)
  if (!digits.startsWith("0") && digits.length >= 11 && digits.length <= 15) {
    return digits;
  }

  // Nazionale IT con 0 iniziale (es. 03758222238)
  if (digits.startsWith("0")) {
    digits = `39${digits.slice(1)}`;
  } else if (digits.length >= 9 && digits.length <= 10) {
    // Nazionale senza 0 (es. 3758222238)
    digits = `39${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string | null {
  const digitsOnly = normalizeWhatsAppDigits(phone);
  if (!digitsOnly) return null;

  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
