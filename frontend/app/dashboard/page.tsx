"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import RoomList from "@/components/RoomList";
import { initialMessages, recommendedRooms } from "@/lib/mock-data";

type MobileTab = "chat" | "rooms";

/**
 * Layout:
 * - Mobile (< md): un solo pannello alla volta, switch con tab in alto
 *   (chat di default, poi "Stanze" quando l'AI ha dei suggerimenti).
 * - Desktop (>= md): split screen, chat a sinistra (fissa), stanze a
 *   destra (scroll indipendente) — come un client di messaggistica.
 */
export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");

  async function handleSendMessage(_text: string): Promise<string> {
    // TODO: sostituire con la chiamata reale, es.
    // const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ text }) });
    // const data = await res.json();
    // return data.reply;
    await new Promise((resolve) => setTimeout(resolve, 700));
    return "Ok, segnato! Continua pure, sto aggiornando i suggerimenti.";
  }

  return (
    <main className="h-dvh bg-bg">
      {/* Tab bar solo mobile */}
      <div className="flex border-b border-sea-100 bg-white md:hidden">
        <TabButton
          label="Chat"
          isActive={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />
        <TabButton
          label={`Stanze (${recommendedRooms.length})`}
          isActive={activeTab === "rooms"}
          onClick={() => setActiveTab("rooms")}
        />
      </div>

      <div className="mx-auto grid h-[calc(100dvh-45px)] max-w-7xl grid-cols-1 md:h-dvh md:grid-cols-[minmax(320px,420px)_1fr]">
        <div
          className={`${activeTab === "chat" ? "block" : "hidden"} h-full md:block md:border-r md:border-sea-100`}
        >
          <ChatPanel
            initialMessages={initialMessages}
            onSendMessage={handleSendMessage}
          />
        </div>

        <div className={`${activeTab === "rooms" ? "block" : "hidden"} h-full md:block`}>
          <RoomList rooms={recommendedRooms} />
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
