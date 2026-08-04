import VestaAvatar from "./VestaAvatar";

export default function TypingIndicator() {
  return (
    <div className="flex w-full items-end justify-start gap-2 animate-fade-in-up">
      <VestaAvatar size={26} />
      <div className="flex items-center gap-1 rounded-xl2 rounded-tl-sm bg-white px-4 py-3 shadow-chat">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-muted/60 animate-bounce"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
