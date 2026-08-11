export default function RoomListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="flex h-full flex-col bg-bg" aria-busy="true" aria-live="polite">
      <header className="border-b border-sea-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
        <div className="h-4 w-40 animate-pulse rounded bg-sea-100" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-sea-50" />
      </header>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl2 bg-surface p-3 shadow-card sm:gap-4 sm:p-4"
          >
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-sea-100 sm:h-28 sm:w-28" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 max-w-[200px] animate-pulse rounded bg-sea-100" />
                  <div className="h-3 w-1/2 max-w-[140px] animate-pulse rounded bg-sea-50" />
                </div>
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-sea-50" />
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <div className="h-5 w-24 animate-pulse rounded-full bg-sea-50" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-sea-50" />
                <div className="h-5 w-28 animate-pulse rounded-full bg-sea-50" />
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                <div className="h-5 w-16 animate-pulse rounded-full bg-sea-50" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-sea-50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
