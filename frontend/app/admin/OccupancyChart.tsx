export default function OccupancyChart({
  occupied,
  free,
}: {
  occupied: number;
  free: number;
}) {
  const total = occupied + free;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;
  const freePct = total > 0 ? (free / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex h-8 overflow-hidden rounded-lg bg-bg">
        {occupied > 0 && (
          <div
            className="bg-sea-600 transition-all"
            style={{ width: `${occupiedPct}%` }}
            title={`Occupate: ${occupied}`}
          />
        )}
        {free > 0 && (
          <div
            className="bg-sea-100 transition-all"
            style={{ width: `${freePct}%` }}
            title={`Libere: ${free}`}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-ink-muted">
        <span>
          <span className="font-semibold text-sea-700">{occupied}</span> occupate
        </span>
        <span>
          <span className="font-semibold text-ink">{free}</span> libere
        </span>
      </div>
    </div>
  );
}
