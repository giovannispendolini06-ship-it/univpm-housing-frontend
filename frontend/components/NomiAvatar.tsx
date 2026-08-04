interface NomiAvatarProps {
  size?: number;
  className?: string;
}

/**
 * Il segno visivo di Nomi: stesso linguaggio del logo Coabito (cerchio +
 * lettera), ma in corallo invece che in teal. La scelta è intenzionale:
 * il teal resta l'identità dell'azienda/della struttura, il corallo
 * diventa "la voce calda che ti parla" — Nomi è ovunque nella chat,
 * quindi merita un colore distinto e riconoscibile a colpo d'occhio.
 */
export default function NomiAvatar({ size = 36, className = "" }: NomiAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-sunset-500 font-display font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      N
    </div>
  );
}
