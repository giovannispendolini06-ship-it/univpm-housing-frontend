"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatPanelProps {
  initialMessages: ChatMessage[];
  /**
   * Callback opzionale chiamata ad ogni invio: qui va collegata la
   * chiamata reale all'endpoint /api/chat che parla con OpenAI.
   */
  onSendMessage?: (text: string) => Promise<string>;
}

export default function ChatPanel({
  initialMessages,
  onSendMessage,
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

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    try {
      const replyText = onSendMessage
        ? await onSendMessage(text)
        : "Ricevuto! (collega qui la risposta reale dell'API OpenAI)";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sea-600 font-display text-sm font-bold text-white">
          D
        </div>
        <div>
          <h1 className="font-display text-sm font-bold text-ink">Dado</h1>
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
