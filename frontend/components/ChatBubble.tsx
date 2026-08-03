import type { ChatMessage } from "@/lib/types";
import NomiAvatar from "./NomiAvatar";

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex items-end gap-2 ${isAssistant ? "justify-start" : "justify-end"} w-full`}
    >
      {isAssistant && <NomiAvatar size={26} />}
      <div
        className={[
          "max-w-[80%] sm:max-w-[70%] rounded-xl2 px-4 py-2.5 text-[15px] leading-relaxed shadow-chat",
          isAssistant
            ? "bg-white text-ink rounded-tl-sm"
            : "bg-sea-600 text-white rounded-tr-sm",
        ].join(" ")}
      >
        {message.content}
      </div>
    </div>
  );
}
