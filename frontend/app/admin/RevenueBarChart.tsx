"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

export default function RevenueBarChart({
  revenue,
  cost,
  margin,
}: {
  revenue: number;
  cost: number;
  margin: number;
}) {
  const data = [
    { name: "Ricavo", value: revenue, color: "#0F6E6A" },
    { name: "Costo", value: cost, color: "#FF6B4A" },
    { name: "Margine", value: margin, color: margin >= 0 ? "#0F6E6A" : "#FF6B4A" },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#5C7A78" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [
            `${Number(value ?? 0).toLocaleString("it-IT")}€`,
            "",
          ]}
          contentStyle={{ borderRadius: 12, border: "1px solid #E7EFEE", fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
