"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import type { RecommendedRoom } from "@/lib/types";
import MatchScoreRing from "./MatchScoreRing";

const WEIGHT_STYLES: Record<
  RecommendedRoom["matchReasons"][number]["weight"],
  string
> = {
  alto: "bg-sea-50 text-sea-700",
  medio: "bg-sand-400/15 text-ink",
  basso: "bg-ink-muted/10 text-ink-muted",
};

export default function RoomCard({ room }: { room: RecommendedRoom }) {
  const { t } = useLocale();
  const total = room.priceMonthly + room.estimatedUtilities;

  const POLO_LABELS: Record<RecommendedRoom["polo"], string> = {
    monte_dago: "Monte Dago",
    torrette: "Torrette",
    centro_economia_giurisprudenza: "Economia · Villarey",
    altro: t.roomCard.otherCampus,
  };

  return (
    <article className="flex gap-3 rounded-xl2 bg-surface p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:gap-4 sm:p-4">
      <img
        src={room.imageUrl}
        alt={room.title}
        className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[15px] font-bold text-ink">
              {room.title}
            </h3>
            <p className="text-xs text-ink-muted">
              {room.zone} · {POLO_LABELS[room.polo]}
            </p>
          </div>
          <MatchScoreRing score={room.matchScore} size={48} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-display font-bold text-ink">
            {room.priceMonthly}€
            <span className="ml-0.5 font-body text-xs font-normal text-ink-muted">
              {t.roomCard.perMonth}{" "}
              {t.roomCard.plusUtilities.replace(
                "{utilities}",
                String(room.estimatedUtilities),
              )}
            </span>
          </span>
          <span className="rounded-full bg-sand-400/15 px-2 py-0.5 text-xs font-semibold text-ink">
            {t.roomCard.total.replace("{total}", String(total))}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sea-50 px-2 py-0.5 text-xs font-medium text-sea-700">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {room.distanceLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {room.servicesIncluded.map((service) => (
            <span
              key={service}
              className="rounded-full border border-sea-100 px-2 py-0.5 text-[11px] text-ink-muted"
            >
              {service}
            </span>
          ))}
        </div>

        <ul className="flex flex-col gap-1 border-t border-bg pt-2">
          {room.matchReasons.slice(0, 3).map((reason) => (
            <li key={reason.label} className="flex items-start gap-1.5 text-xs">
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-medium ${WEIGHT_STYLES[reason.weight]}`}
              >
                {reason.label}
              </span>
              <span className="text-ink-muted">{reason.detail}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] text-ink-muted">
            {t.roomCard.availableFrom.replace("{date}", room.availableFrom)}
          </span>
          <button className="rounded-full bg-sunset-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sunset-600">
            {t.roomCard.viewListing}
          </button>
        </div>
      </div>
    </article>
  );
}
