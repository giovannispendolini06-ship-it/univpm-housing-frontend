type PipelineRow = {
  stage: string;
  annunci: number;
  richieste: number;
};

export default function PipelineChart({ data }: { data: PipelineRow[] }) {
  const maxValue = Math.max(
    ...data.flatMap((d) => [d.annunci, d.richieste]),
    1,
  );

  return (
    <div className="space-y-4">
      {data.map((row) => (
        <div key={row.stage}>
          <p className="mb-2 text-xs font-semibold text-ink">{row.stage}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-ink-muted">Annunci</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-sea-600"
                  style={{ width: `${(row.annunci / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-[11px] font-semibold text-ink">
                {row.annunci}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-ink-muted">Richieste</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-sunset-400"
                  style={{ width: `${(row.richieste / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-[11px] font-semibold text-ink">
                {row.richieste}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
