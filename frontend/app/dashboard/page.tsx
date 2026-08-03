"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import RoomList from "@/components/RoomList";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
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
 *
 * Al primo caricamento, ricarica dal database la conversazione con Nomi
 * e le stanze già calcolate (invece di ripartire sempre da zero): due
 * semplici query indicizzate, nessuna chiamata a OpenAI, quindi resta
 * leggero e veloce anche per chi torna il giorno dopo.
 */
export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rooms, setRooms] = useState<RecommendedRoom[]>([]);
  // null = ancora in caricamento: evita di mostrare per un istante il
  // messaggio di benvenuto e poi "saltare" alla cronologia vera.
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id ?? null;
      setStudentId(userId);

      if (!userId) {
        setInitialMessages([WELCOME_MESSAGE]);
        return;
      }

      // Ruolo (per il badge Admin)
      supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single()
        .then(({ data: profile }) => {
          setIsAdmin(profile?.role === "admin");
        });

      // Storico chat: se esiste già una conversazione, la ricarichiamo
      // invece del messaggio di benvenuto.
      supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("student_id", userId)
        .order("created_at", { ascending: true })
        .then(({ data: history, error }) => {
          if (error) {
            console.error("Errore nel caricamento della cronologia chat:", error);
            setInitialMessages([WELCOME_MESSAGE]);
            return;
          }
          if (history && history.length > 0) {
            setInitialMessages(
              history.map((m) => ({
                id: m.id,
                role: m.role as ChatMessage["role"],
                content: m.content,
                createdAt: m.created_at,
              })),
            );
          } else {
            setInitialMessages([WELCOME_MESSAGE]);
          }
        });

      // Stanze già calcolate in precedenza: così non serve riscrivere a
      // Nomi solo per rivederle.
      fetch(`/api/matches?studentId=${userId}`)
        .then((res) => (res.ok ? res.json() : { rooms: [] }))
        .then((data) => setRooms(data.rooms ?? []))
        .catch(() => setRooms([]));
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
      <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-card"
            >
              Admin
            </Link>
          )}
          <SignOutButton className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card" />
        </div>
        <DeleteAccountButton className="rounded-full bg-white/70 px-2 py-1 text-[10px] text-ink-muted underline underline-offset-2 transition hover:text-sunset-600" />
      </div>

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
          {initialMessages ? (
            <ChatPanel
              initialMessages={initialMessages}
              onSendMessage={handleSendMessage}
              onRoomsUpdate={setRooms}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-muted">
              Caricamento...
            </div>
          )}
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
