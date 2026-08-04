interface CoabitoLogoProps {
  size?: number;
  className?: string;
}

/**
 * Il logomark di Coabito: un attaccapanni con un abito appeso, stilizzato
 * in modo essenziale. Nasce da un gioco di parole nel nome stesso —
 * "co-ABITO" contiene la parola "abito" (vestito) — reso visivamente
 * invece che forzando le lettere a sembrare un indumento (rischioso da
 * eseguire bene). Il piccolo bottone corallo è un dettaglio di calore,
 * non solo decorativo: richiama anche un possibile nome per la mascotte
 * dell'assistente ("Bottone").
 *
 * Il badge è un quadrato arrotondato, non un cerchio: stessa scelta di
 * prima, per non ripetere la forma usata ovunque per bottoni e badge.
 */
export default function CoabitoLogo({ size = 32, className = "" }: CoabitoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0F6E6A" />
      {/* Gancio dell'attaccapanni */}
      <path
        d="M16 6.5 Q16 3.5 19 4.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Maglietta appesa: incavo del colletto, spalle, maniche, corpo */}
      <path
        d="M13 8 L16 10.2 L19 8 L24.5 12 L21 15.2 L21 26 L11 26 L11 15.2 L7.5 12 Z"
        fill="#ffffff"
      />
      {/* Bottone, dettaglio di calore */}
      <circle cx="16" cy="18" r="1.3" fill="#FF6B4A" />
    </svg>
  );
}
