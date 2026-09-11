import type { MarketReportStats, PartnerTierSnapshot } from "@/lib/partner-tier";
import {
  PARTNER_CLOSED_LEASES_THRESHOLD,
  partnerBadgeLabel,
} from "@/lib/partner-tier";

const TIER_COPY: Record<
  PartnerTierSnapshot["tier"],
  { title: string; blurb: string }
> = {
  standard: {
    title: "Standard",
    blurb:
      "Pubblicate annunci e chiudete contratti su Coabito. A 3 chiusure negli ultimi 12 mesi diventate Partner automaticamente.",
  },
  partner: {
    title: "Partner Coabito",
    blurb:
      "Badge pubblico sugli annunci, priorità di visibilità in ricerca e accesso al report di mercato.",
  },
  fondatrice: {
    title: "Agenzia Fondatrice",
    blurb:
      "Stesso riconoscimento Partner, con success fee ridotta permanente (founding_rate). Il livello non viene mai declassato automaticamente.",
  },
};

export default function OwnerPartnerPanel({
  snapshot,
  marketReport,
}: {
  snapshot: PartnerTierSnapshot;
  marketReport: MarketReportStats[];
}) {
  const copy = TIER_COPY[snapshot.tier];
  const badge = partnerBadgeLabel(snapshot.tier);
  const showReport =
    snapshot.tier === "partner" || snapshot.tier === "fondatrice";

  return (
    <section className="mb-6 space-y-4">
      <div className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Programma partner
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">{copy.title}</h2>
          {badge ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                snapshot.tier === "fondatrice"
                  ? "bg-sunset-500/15 text-sunset-600"
                  : "bg-sea-600 text-white"
              }`}
            >
              {badge}
            </span>
          ) : null}
          {snapshot.foundingRate ? (
            <span className="rounded-full bg-sea-50 px-2.5 py-0.5 text-[10px] font-semibold text-sea-700">
              founding_rate
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-ink-muted">{copy.blurb}</p>

        {snapshot.tier === "standard" ? (
          <p className="mt-3 rounded-xl bg-sea-50 px-3 py-2.5 text-sm text-ink">
            <span className="font-display font-bold tabular-nums text-sea-700">
              {snapshot.closedLeasesLast12Months}
            </span>
            {" / "}
            {PARTNER_CLOSED_LEASES_THRESHOLD} contratti chiusi negli ultimi 12 mesi
            {snapshot.leasesNeededForPartner > 0
              ? ` — ne mancano ${snapshot.leasesNeededForPartner} per diventare Partner`
              : " — soglia raggiunta, aggiornamento in corso"}
            .
          </p>
        ) : (
          <p className="mt-3 text-xs text-ink-muted">
            Contratti chiusi (12 mesi):{" "}
            <strong className="text-ink">{snapshot.closedLeasesLast12Months}</strong>
          </p>
        )}

        <a
          href="/agenzie"
          className="mt-3 inline-block text-xs font-semibold text-sea-700 underline"
        >
          Scopri il programma partner
        </a>
      </div>

      {showReport ? (
        <div className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card sm:p-5">
          <h3 className="font-display text-base font-bold text-ink">
            Report di mercato
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Statistiche aggregate sulle zone dei vostri annunci (ultimi 12 mesi).
          </p>
          {marketReport.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              Pubblicate almeno un annuncio con zona per vedere i dati.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {marketReport.map((row) => (
                <li
                  key={row.zone}
                  className="rounded-xl border border-sea-100 px-3 py-2.5 text-sm"
                >
                  <p className="font-display font-bold text-ink">{row.zone}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-ink-muted sm:grid-cols-3">
                    <div>
                      <dt>Prezzo medio</dt>
                      <dd className="font-semibold text-ink">
                        {row.avgMonthlyRent != null
                          ? `${row.avgMonthlyRent}€/mese`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Annunci in zona</dt>
                      <dd className="font-semibold text-ink">{row.listingCount}</dd>
                    </div>
                    <div>
                      <dt>Occupazione media</dt>
                      <dd className="font-semibold text-ink">
                        {row.avgOccupancyDays != null
                          ? `${row.avgOccupancyDays} giorni`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
