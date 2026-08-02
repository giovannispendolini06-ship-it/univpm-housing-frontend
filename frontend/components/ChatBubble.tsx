import type { ChatMessage } from "@/lib/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex animate-fade-up ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "rounded-br-md bg-ink-800 text-ink-50"
            : "rounded-bl-md bg-white text-ink-900 shadow-soft ring-1 ring-ink-100"
        }`}
      >
        {!isUser && (
          <p className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-ink-500">
            Dado
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
