export function TypingIndicator() {
  return (
    <div className="flex animate-fade-up justify-start" aria-live="polite">
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-soft ring-1 ring-ink-100">
        <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-ink-500">
          Dado sta scrivendo...
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-ink-400 animate-pulseDot"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
