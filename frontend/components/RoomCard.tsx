import type { MatchedRoom } from "@/lib/types";
import { MatchScoreRing } from "./MatchScoreRing";

interface RoomCardProps {
  room: MatchedRoom;
}

function formatRent(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <article className="animate-fade-up border-b border-ink-100 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <MatchScoreRing score={room.matchScore} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-ink-900">
              {room.title}
            </h3>
            <p className="shrink-0 font-display text-sm font-semibold text-ink-700">
              {formatRent(room.rentMonthly)}
              <span className="font-sans text-xs font-normal text-ink-400">
                /mese
              </span>
            </p>
          </div>
          <p className="mt-0.5 text-sm text-ink-500">
            {room.neighborhood}, {room.city} · disponibile dal{" "}
            {new Date(room.availableFrom).toLocaleDateString("it-IT")}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">
            {room.description}
          </p>
          {room.matchReasons.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
              {room.matchReasons.map((reason) => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
