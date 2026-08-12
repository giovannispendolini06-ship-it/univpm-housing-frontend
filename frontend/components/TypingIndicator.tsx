import VestaAvatar from "./VestaAvatar";

export default function TypingIndicator({ label }: { label: string }) {
  return (
    <div
      className="flex w-full items-end justify-start gap-2 animate-fade-in-up"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <VestaAvatar size={26} />
      <div className="flex items-center gap-2.5 rounded-xl2 rounded-tl-sm bg-white px-4 py-2.5 shadow-chat">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-sea-600/70 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
        <span className="text-xs font-medium text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
