"use client";

interface MatchScoreRingProps {
  score: number; // 0-100
  size?: number; // px
}

// Soglie di colore: alto match = teal (identità del brand),
// medio = sabbia, basso = neutro. Mai rosso: anche un match basso
// è comunque un'opzione, non un errore.
function getScoreColor(score: number): { stroke: string; text: string } {
  if (score >= 85) return { stroke: "#0F6E6A", text: "text-sea-700" };
  if (score >= 65) return { stroke: "#FFB13D", text: "text-ink" };
  return { stroke: "#9AAFAD", text: "text-ink-muted" };
}

export default function MatchScoreRing({
  score,
  size = 56,
}: MatchScoreRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, text } = getScoreColor(score);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Compatibilità ${score} per cento`}
    >
      <svg width={size} height={size} className="-rotate-90">
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
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-display text-sm font-bold ${text}`}>
          {score}%
        </span>
      </div>
    </div>
  );
}
