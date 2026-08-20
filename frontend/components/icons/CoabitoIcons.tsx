/**
 * Custom line-art icons — teal #0F6E6A + coral #FF6B4A accent.
 * Matches the Coabito icon set style (rounded caps, clean stroke).
 * Nav icons use currentColor for active/inactive states.
 */

const SEA = "#0F6E6A";
const CORAL = "#FF6B4A";

type IconProps = {
  size?: number;
  className?: string;
};

/** Casa — proprietario / stanze */
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
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12.5 27.5 V18.5 H19.5 V27.5"
        stroke="currentColor"
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

/** Chat — Vesta */
export function IconChat({ size = 24, className = "" }: IconProps) {
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
        d="M7 8.5 H25 a2.5 2.5 0 0 1 2.5 2.5 V20 a2.5 2.5 0 0 1 -2.5 2.5 H14 L9 27 V22.5 H7 A2.5 2.5 0 0 1 4.5 20 V11 A2.5 2.5 0 0 1 7 8.5 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15.5" r="1.2" fill={CORAL} />
      <circle cx="16.5" cy="15.5" r="1.2" fill="currentColor" opacity="0.45" />
      <circle cx="21" cy="15.5" r="1.2" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** Documento — candidature */
export function IconDocumento({ size = 24, className = "" }: IconProps) {
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
        d="M10 5.5 H18.5 L25.5 12.5 V26 a1.5 1.5 0 0 1 -1.5 1.5 H10 A1.5 1.5 0 0 1 8.5 26 V7 A1.5 1.5 0 0 1 10 5.5 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 5.5 V12.5 H25.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12.5 17 H20.5" stroke={CORAL} strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M12.5 21 H18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Messaggi peer (due bolle) */
export function IconMessaggi({ size = 24, className = "" }: IconProps) {
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
        d="M6 7.5 H18.5 a2 2 0 0 1 2 2 V15.5 a2 2 0 0 1 -2 2 H11 L7.5 21 V17.5 H6 a2 2 0 0 1 -2 -2 V9.5 a2 2 0 0 1 2 -2 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 14 H26 a2 2 0 0 1 2 2 V22 a2 2 0 0 1 -2 2 H21 L17.5 27.5 V24 H13.5 a2 2 0 0 1 -2 -2 V16 a2 2 0 0 1 2 -2 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="19" r="1.15" fill={CORAL} />
    </svg>
  );
}

/** Profilo */
export function IconProfilo({ size = 24, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="16"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M7.5 26.5 C7.5 21.5 11 18.5 16 18.5 C21 18.5 24.5 21.5 24.5 26.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="20.5" cy="10.5" r="1.2" fill={CORAL} />
    </svg>
  );
}
