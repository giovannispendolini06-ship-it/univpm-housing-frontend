import type { RecommendedRoom } from "@/lib/types";
import RoomCard from "./RoomCard";

export default function RoomList({ rooms }: { rooms: RecommendedRoom[] }) {
  const sorted = [...rooms].sort((a, b) => b.matchScore - a.matchScore);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-sm font-bold text-ink">
          Ancora nessuna stanza da mostrarti
        </p>
        <p className="max-w-xs text-sm text-ink-muted">
          Continua a chattare con Domi: appena avrà budget, polo e abitudini
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
        {sorted.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}
