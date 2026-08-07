"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS: { value: string; label: string; countKey: keyof Counts }[] = [
  { value: "", label: "Tutti", countKey: "all" },
  { value: "pagato", label: "Pagato", countKey: "pagato" },
  { value: "da_registrare", label: "In scadenza", countKey: "da_registrare" },
  { value: "in_ritardo", label: "In ritardo", countKey: "in_ritardo" },
  { value: "fallito", label: "Fallito", countKey: "fallito" },
];

type Counts = {
  all: number;
  pagato: number;
  da_registrare: number;
  in_ritardo: number;
  fallito: number;
};

export default function PaymentsStatusFilter({
  current,
  counts,
}: {
  current: string;
  counts: Counts;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("stato", value);
    else params.delete("stato");
    const qs = params.toString();
    router.push(qs ? `/admin/payments?${qs}` : "/admin/payments");
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map((f) => {
        const active = current === f.value;
        const count = counts[f.countKey];
        if (f.value && count === 0 && !active) return null;
        return (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? "bg-sea-600 text-white" : "bg-sea-50 text-sea-700"
            }`}
          >
            {f.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
