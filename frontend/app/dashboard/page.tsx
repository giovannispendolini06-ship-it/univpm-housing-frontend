"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { RoomList } from "@/components/RoomList";
import type {
  ChatMessage,
  ChatResponseBody,
  MatchedRoom,
  UserPreferences,
} from "@/lib/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao, sono Dado. Dimmi dove vorresti vivere, quanto puoi spendere e che tipo di casa cerchi: ti propongo le stanze più in linea con te.",
  createdAt: new Date().toISOString(),
};

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [rooms, setRooms] = useState<MatchedRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  async function handleSend(text: string) {
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsTyping(true);
    setIsMatching(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = (await response.json()) as ChatResponseBody;

      setPreferences(data.preferences);
      setRooms(data.rooms);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Ops, qualcosa non ha funzionato. Riprova tra un attimo — nel frattempo puoi dirmi pure budget e quartiere.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsMatching(false);
    }
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-6xl flex-col px-3 py-3 md:px-5 md:py-5">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
            Dado
          </p>
          <p className="text-sm text-ink-500">
            Chat + matching stanze in un’unica schermata
          </p>
        </div>
        {Object.keys(preferences).length > 0 && (
          <p className="hidden text-xs text-ink-400 sm:block">
            Preferenze aggiornate
          </p>
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-0 overflow-hidden rounded-3xl bg-[var(--bg-panel)] shadow-soft ring-1 ring-ink-100">
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
          />
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white/70 shadow-soft ring-1 ring-ink-100 backdrop-blur">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Stanze per te
            </h2>
            <p className="text-xs text-ink-500">
              Ordinate per match score in tempo reale
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <RoomList rooms={rooms} isLoading={isMatching && !rooms.length} />
          </div>
        </aside>
      </div>
    </main>
  );
}
