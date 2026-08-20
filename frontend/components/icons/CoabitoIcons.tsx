/**
 * Custom line-art icons — teal #0F6E6A + coral #FF6B4A accent.
 * Matches the Coabito icon set style (rounded caps, clean stroke).
 */

const SEA = "#0F6E6A";
const CORAL = "#FF6B4A";

type IconProps = {
  size?: number;
  className?: string;
};

/** Casa — proprietario */
export function IconCasa({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5.5 14.5 L16 5.5 L26.5 14.5 V26 a1.5 1.5 0 0 1 -1.5 1.5 H7 A1.5 1.5 0 0 1 5.5 26 Z"
        stroke={SEA}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12.5 27.5 V18.5 H19.5 V27.5"
        stroke={SEA}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="17.6" cy="22.5" r="1.15" fill={CORAL} />
    </svg>
  );
}

/**
 * Studente — zaino stilizzato (non nel set base; stesso tratto teal + accento corallo).
 * Alternativa naturale a “casa” per chi cerca stanza.
 */
export function IconStudente({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M10 12.5 H22 a2 2 0 0 1 2 2 V25 a2 2 0 0 1 -2 2 H10 a2 2 0 0 1 -2 -2 V14.5 a2 2 0 0 1 2 -2 Z"
        stroke={SEA}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5 V10.5 a4 4 0 0 1 8 0 V12.5"
        stroke={SEA}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13.5 18 H18.5"
        stroke={CORAL}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13.5 21.5 H16.5"
        stroke={CORAL}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
