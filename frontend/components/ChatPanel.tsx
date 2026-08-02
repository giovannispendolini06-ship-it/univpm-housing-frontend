"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, isTyping, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isTyping) return;
    onSend(text);
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 font-display text-sm font-bold text-mist">
          D
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Dado
          </h2>
          <p className="text-xs text-ink-500">
            Ti aiuta a trovare stanza e coinquilini
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-ink-100 bg-white/80 px-4 py-3 backdrop-blur"
      >
        <div className="flex items-end gap-2 rounded-2xl bg-mist px-3 py-2 ring-1 ring-ink-100 focus-within:ring-ink-300">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Scrivi a Dado..."
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2 text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isTyping}
            className="mb-1 rounded-xl bg-ink-800 px-4 py-2 font-display text-sm font-semibold text-mist transition enabled:hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Invia
          </button>
        </div>
      </form>
    </section>
  );
}
