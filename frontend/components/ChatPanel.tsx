"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import VestaAvatar from "./VestaAvatar";

interface ChatPanelProps {
  initialMessages: ChatMessage[];
  /**
   * Collegata a /api/chat: riceve il testo scritto dallo studente e
   * restituisce la risposta di Vesta più (eventualmente) le stanze
   * ricalcolate dal motore di matching.
   */
  onSendMessage: (
    text: string,
    history: { role: ChatMessage["role"]; content: string }[],
  ) => Promise<{ reply: string; rooms?: RecommendedRoom[] }>;
  /** Chiamata ogni volta che l'API restituisce una lista stanze aggiornata. */
  onRoomsUpdate?: (rooms: RecommendedRoom[]) => void;
}

export default function ChatPanel({
  initialMessages,
  onSendMessage,
  onRoomsUpdate,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const historyForApi = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    try {
      const { reply, rooms } = await onSendMessage(text, historyForApi);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (rooms) onRoomsUpdate?.(rooms);
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Uhm, qualcosa è andato storto dal mio lato. Puoi riprovare tra un attimo?",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="flex h-full flex-col bg-bg">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-sea-100 bg-white/80 px-4 py-3 backdrop-blur">
        <VestaAvatar size={36} />
        <div>
          <h1 className="font-display text-sm font-bold text-ink">Vesta</h1>
          <p className="text-xs text-ink-muted">
            Il tuo assistente casa · UNIVPM Ancona
          </p>
        </div>
      </header>

      {/* Messaggi */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="border-t border-sea-100 bg-white p-3">
        <div className="flex items-end gap-2 rounded-xl2 border border-sea-100 bg-bg px-3 py-2 focus-within:border-sea-400">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            className="max-h-28 flex-1 resize-none bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Invia messaggio"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea-600 text-white transition enabled:hover:bg-sea-700 disabled:cursor-not-allowed disabled:bg-sea-100 disabled:text-ink-muted"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
