"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function OccupancyChart({
  occupied,
  free,
}: {
  occupied: number;
  free: number;
}) {
  const total = occupied + free;
  const data = [
    { name: "Occupate", value: occupied || 0 },
    { name: "Libere", value: free || 0.0001 }, // evita un grafico vuoto se tutto è a 0
  ];
  const COLORS = ["#0F6E6A", "#E7EFEE"];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={2}
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-ink">
          {total > 0 ? Math.round((occupied / total) * 100) : 0}%
        </span>
        <span className="text-[11px] text-ink-muted">occupazione</span>
      </div>
    </div>
  );
}
