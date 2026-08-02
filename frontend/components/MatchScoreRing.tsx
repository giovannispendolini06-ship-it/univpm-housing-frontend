interface MatchScoreRingProps {
  score: number;
  size?: number;
}

export function MatchScoreRing({ score, size = 52 }: MatchScoreRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 80 ? "#3c5f44" : clamped >= 60 ? "#6f9477" : "#c4875a";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Match score ${clamped}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e3ebe4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-display text-sm font-semibold text-ink-900">
        {clamped}
      </span>
    </div>
  );
}
