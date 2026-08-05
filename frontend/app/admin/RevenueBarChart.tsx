export default function RevenueBarChart({
  revenue,
  cost,
  margin,
}: {
  revenue: number;
  cost: number;
  margin: number;
}) {
  const max = Math.max(revenue, cost, Math.abs(margin), 1);

  const barWidth = (value: number) => `${Math.max((value / max) * 100, 0)}%`;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>Ricavo</span>
          <span className="font-semibold text-ink">{revenue.toLocaleString("it-IT")}€</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full rounded-full bg-sea-600" style={{ width: barWidth(revenue) }} />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>Costo</span>
          <span className="font-semibold text-ink">{cost.toLocaleString("it-IT")}€</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full rounded-full bg-sand-400" style={{ width: barWidth(cost) }} />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>Margine</span>
          <span
            className={`font-semibold ${margin >= 0 ? "text-sea-700" : "text-sunset-600"}`}
          >
            {margin.toLocaleString("it-IT")}€
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div
            className={`h-full rounded-full ${margin >= 0 ? "bg-sea-400" : "bg-sunset-500"}`}
            style={{ width: barWidth(Math.abs(margin)) }}
          />
        </div>
      </div>
    </div>
  );
}
