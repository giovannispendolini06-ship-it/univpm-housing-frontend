import type { ChatMessage } from "@/lib/types";
import VestaAvatar from "./VestaAvatar";
import { renderVestaMessageContent } from "./ChatMessageContent";

/**
 * Visual thread: Vesta (assistant) left / neutral; student (user) right / coral.
 * Labels make attribution obvious even in long histories.
 * Domande di Vesta: grassetto + teal (tag <QUESTION> o frasi con "?").
 */
export default function ChatBubble({
  message,
  showLabel = true,
}: {
  message: ChatMessage;
  showLabel?: boolean;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex w-full items-end gap-2 animate-fade-in-up ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {isAssistant && (
        <div className="mb-0.5 shrink-0">
          <VestaAvatar size={28} />
        </div>
      )}
      <div
        className={`flex max-w-[82%] flex-col sm:max-w-[72%] ${
          isAssistant ? "items-start" : "items-end"
        }`}
      >
        {showLabel && (
          <span
            className={`mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide ${
              isAssistant ? "text-sea-700" : "text-sunset-600"
            }`}
          >
            {isAssistant ? "Vesta" : "Tu"}
          </span>
        )}
        <div
          className={[
            "rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-chat whitespace-pre-wrap",
            isAssistant
              ? "rounded-tl-md border border-sea-100 bg-white text-ink"
              : "rounded-tr-md bg-sunset-500 text-white",
          ].join(" ")}
        >
          {isAssistant
            ? renderVestaMessageContent(message.content)
            : message.content}
        </div>
      </div>
    </div>
  );
}
