interface VestaAvatarProps {
  size?: number;
  className?: string;
}

/**
 * Il segno visivo di Vesta: una piccola fiamma con un volto amichevole,
 * non più un cerchio con una lettera dentro. Il nome viene dalla dea
 * romana del focolare domestico — la fiamma è quindi un legame diretto
 * col significato, non un'icona scelta a caso. Il corallo resta il
 * colore distintivo dell'assistente (il teal è l'identità dell'azienda),
 * qui usato per la fiamma stessa invece che come sfondo di un cerchio.
 */
export default function VestaAvatar({ size = 36, className = "" }: VestaAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#FF6B4A" />
      {/* Fiamma esterna */}
      <path
        d="M16 5 C21 11 23 15 22 19 C21 24 18.5 27 16 27 C13.5 27 11 24 10 19 C9.5 16.5 10.5 13.5 12 11.5 C12.2 14.5 13.5 16 13.5 16 C13.2 12.5 14 9 16 5 Z"
        fill="#ffffff"
        opacity="0.95"
      />
      {/* Fiamma interna */}
      <path
        d="M16 12 C18.5 15.5 19.5 18 18.8 20.5 C18.2 23 17 24.5 16 24.5 C15 24.5 13.8 23 13.2 20.5 C12.7 18.5 13.3 16.5 14.2 15 C14.3 17 15 17.8 15 17.8 C14.9 15.8 15.2 14 16 12 Z"
        fill="#FFB13D"
      />
      {/* Occhi */}
      <circle cx="14.3" cy="19.5" r="0.9" fill="#0F2A2E" />
      <circle cx="17.7" cy="19.5" r="0.9" fill="#0F2A2E" />
      {/* Sorriso */}
      <path
        d="M14.5 21.5 Q16 23 17.5 21.5"
        stroke="#0F2A2E"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
