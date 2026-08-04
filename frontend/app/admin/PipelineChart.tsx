"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PipelineChartProps {
  data: { stage: string; annunci: number; richieste: number }[];
}

export default function PipelineChart({ data }: PipelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11, fill: "#5C7A78" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7EFEE", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="annunci" name="Annunci esterni" fill="#0F6E6A" radius={[6, 6, 0, 0]} />
        <Bar dataKey="richieste" name="Richieste proprietari" fill="#FF6B4A" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
