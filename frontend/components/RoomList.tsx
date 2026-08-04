import type { RecommendedRoom } from "@/lib/types";
import RoomCard from "./RoomCard";

export default function RoomList({ rooms }: { rooms: RecommendedRoom[] }) {
  const sorted = [...rooms].sort((a, b) => b.matchScore - a.matchScore);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sea-50">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sea-500"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
        </div>
        <p className="font-display text-sm font-bold text-ink">
          Ancora nessuna stanza da mostrarti
        </p>
        <p className="max-w-xs text-sm text-ink-muted">
          Continua a chattare con Vesta: appena avrà budget, polo e abitudini
          troverà le stanze più compatibili con te.
        </p>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col bg-bg">
      <header className="border-b border-sea-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
        <h2 className="font-display text-sm font-bold text-ink">
          Stanze consigliate per te
        </h2>
        <p className="text-xs text-ink-muted">
          {sorted.length} risultati ordinati per compatibilità
        </p>
      </header>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {sorted.map((room, index) => (
          <div
            key={room.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <RoomCard room={room} />
          </div>
        ))}
      </div>
    </section>
  );
}
