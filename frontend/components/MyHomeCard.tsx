export interface MyTenancy {
  startedAt: string;
  roomLabel: string;
  priceMonthly: number;
  estimatedUtilities: number;
  address: string;
  zone: string | null;
  paymentStatus: "da_registrare" | "pagato" | "in_ritardo";
}

const STATUS_LABELS: Record<MyTenancy["paymentStatus"], string> = {
  da_registrare: "In attesa di conferma",
  pagato: "Pagato questo mese ✓",
  in_ritardo: "In ritardo",
};

const STATUS_STYLES: Record<MyTenancy["paymentStatus"], string> = {
  da_registrare: "bg-white/20 text-white",
  pagato: "bg-white text-sea-700",
  in_ritardo: "bg-sunset-500 text-white",
};

export default function MyHomeCard({ tenancy }: { tenancy: MyTenancy }) {
  const total = tenancy.priceMonthly + tenancy.estimatedUtilities;

  return (
    <div className="animate-fade-in-up mx-3 mt-3 rounded-xl2 bg-gradient-to-br from-sea-600 to-sea-700 p-4 text-white shadow-card sm:mx-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold">🏠 La mia casa</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[tenancy.paymentStatus]}`}
        >
          {STATUS_LABELS[tenancy.paymentStatus]}
        </span>
      </div>

      <p className="mt-1 text-xs text-sea-100">
        {tenancy.roomLabel} · {tenancy.address}
        {tenancy.zone ? ` · ${tenancy.zone}` : ""}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-sea-100">Affitto</p>
          <p className="font-display text-base font-bold">{tenancy.priceMonthly}€</p>
        </div>
        <div>
          <p className="text-[10px] text-sea-100">Utenze stimate</p>
          <p className="font-display text-base font-bold">{tenancy.estimatedUtilities}€</p>
        </div>
        <div className="rounded-lg bg-white/10 py-1">
          <p className="text-[10px] text-sea-100">Totale/mese</p>
          <p className="font-display text-base font-bold">{total}€</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-sea-100">
        Inquilino dal {new Date(tenancy.startedAt).toLocaleDateString("it-IT")}
      </p>
    </div>
  );
}
