interface LoadingRingProps {
  size?: number;
}

/**
 * Stesso linguaggio visivo di MatchScoreRing (l'elemento più
 * riconoscibile del prodotto), qui usato come indicatore di
 * caricamento: un arco che gira invece di un cerchio che si riempie
 * fino a una percentuale. Coerenza visiva invece di un'animazione
 * generica scollegata dal resto del brand.
 */
export default function LoadingRing({ size = 40 }: LoadingRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="animate-spin"
      style={{ width: size, height: size, animationDuration: "1.1s" }}
      role="status"
      aria-label="Caricamento"
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7EFEE"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0F6E6A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
        />
      </svg>
    </div>
  );
}
