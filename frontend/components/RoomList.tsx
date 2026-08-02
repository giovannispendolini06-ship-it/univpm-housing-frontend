import type { MatchedRoom } from "@/lib/types";
import { RoomCard } from "./RoomCard";

interface RoomListProps {
  rooms: MatchedRoom[];
  isLoading?: boolean;
}

export function RoomList({ rooms, isLoading }: RoomListProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-ink-600" />
        <p className="mt-4 font-display text-sm text-ink-500">
          Sto cercando le stanze più adatte...
        </p>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="font-display text-lg font-semibold text-ink-800">
          Nessuna stanza ancora
        </p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
          Racconta a Dado dove vuoi vivere, il budget e lo stile di vita: le
          proposte appariranno qui.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y-0 px-4 pb-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
