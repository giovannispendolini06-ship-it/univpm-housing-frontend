interface BindoLogoProps {
  size?: number;
  className?: string;
}

/**
 * Il logomark di Bindo: non un cerchio con una lettera dentro (il
 * pattern più generico e riconoscibile di un logo fatto "in fretta"),
 * ma un piccolo pittogramma che racconta la doppia anima del prodotto —
 * una casa, e un arco che richiama lo stesso "anello di compatibilità"
 * usato nelle schede stanza (MatchScoreRing) — così anche il logo parla
 * la stessa lingua visiva del resto del prodotto, invece di essere un
 * elemento isolato e sostituibile.
 *
 * Il badge è un quadrato arrotondato, non un cerchio: apposta per non
 * ripetere la stessa identica forma usata ovunque per bottoni e badge.
 */
export default function BindoLogo({ size = 32, className = "" }: BindoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0F6E6A" />
      {/* Casa: tetto + corpo, con una porta "ritagliata" nel colore di sfondo */}
      <path d="M16 6 L25 14.5 H22.5 V25 H9.5 V14.5 H7 Z" fill="#ffffff" />
      <rect x="14" y="19" width="4" height="6" rx="0.5" fill="#0F6E6A" />
      {/* Arco: lo stesso motivo del MatchScoreRing usato nelle schede stanza */}
      <path
        d="M22 8.5 A5.5 5.5 0 0 1 25.5 13"
        stroke="#FF6B4A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
