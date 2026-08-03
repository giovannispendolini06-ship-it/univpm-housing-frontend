"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import RoomList from "@/components/RoomList";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";

type MobileTab = "chat" | "rooms";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Ehi! 👋 Sono Nomi, ti aiuto a trovare casa qui ad Ancona. Che facoltà fai?",
  createdAt: new Date().toISOString(),
};

/**
 * Layout:
 * - Mobile (< md): un solo pannello alla volta, switch con tab in alto.
 * - Desktop (>= md): split screen, chat a sinistra (fissa), stanze a
 *   destra (scroll indipendente).
 *
 * Questa pagina è protetta da middleware.ts: se non sei loggato, Next.js
 * ti reindirizza automaticamente a /login prima di arrivare qui.
 */
export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rooms, setRooms] = useState<RecommendedRoom[]>([]);

  useEffect(() => {
    const supabase = createClientSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id ?? null;
      setStudentId(userId);

      if (userId) {
        supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === "admin");
          });
      }
    });
  }, []);

  async function handleSendMessage(
    text: string,
    history: { role: ChatMessage["role"]; content: string }[],
  ): Promise<{ reply: string; rooms?: RecommendedRoom[] }> {
    if (!studentId) {
      return {
        reply: "Devi effettuare il login per parlare con me — ricarica la pagina.",
      };
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, message: text, history }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        reply:
          data?.error ??
          "Qualcosa è andato storto dal mio lato, riprova tra poco.",
      };
    }

    const data = await res.json();
    return { reply: data.reply, rooms: data.rooms };
  }

  return (
    <main className="relative h-dvh bg-bg">
      {isAdmin && (
        <Link
          href="/admin"
          className="fixed right-3 top-3 z-50 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-card"
        >
          Admin
        </Link>
      )}

      {/* Tab bar solo mobile */}
      <div className="flex border-b border-sea-100 bg-white md:hidden">
        <TabButton
          label="Chat"
          isActive={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />
        <TabButton
          label={`Stanze (${rooms.length})`}
          isActive={activeTab === "rooms"}
          onClick={() => setActiveTab("rooms")}
        />
      </div>

      <div className="mx-auto grid h-[calc(100dvh-45px)] max-w-7xl grid-cols-1 md:h-dvh md:grid-cols-[minmax(320px,420px)_1fr]">
        <div
          className={`${activeTab === "chat" ? "block" : "hidden"} h-full md:block md:border-r md:border-sea-100`}
        >
          <ChatPanel
            initialMessages={[WELCOME_MESSAGE]}
            onSendMessage={handleSendMessage}
            onRoomsUpdate={setRooms}
          />
        </div>

        <div className={`${activeTab === "rooms" ? "block" : "hidden"} h-full md:block`}>
          <RoomList rooms={rooms} />
        </div>
      </div>
    </main>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 border-b-2 py-2.5 text-sm font-medium transition",
        isActive
          ? "border-sea-600 text-sea-700"
          : "border-transparent text-ink-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
