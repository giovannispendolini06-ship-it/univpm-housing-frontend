"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { RecommendedRoom } from "@/lib/types";
import RoomCard from "./RoomCard";

export default function RoomList({
  rooms,
  waitlisted = false,
}: {
  rooms: RecommendedRoom[];
  waitlisted?: boolean;
}) {
  const { t } = useLocale();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const sorted = [...rooms].sort((a, b) => b.matchScore - a.matchScore);

  async function handleShare() {
    const url = `${window.location.origin}/lista-attesa`;
    const text = `${t.roomList.shareText} ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Coabito", text: t.roomList.shareText, url });
      } else {
        await navigator.clipboard.writeText(text);
        setShareFeedback(t.roomList.shareCta + " ✓");
        setTimeout(() => setShareFeedback(null), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareFeedback(t.roomList.shareCta + " ✓");
        setTimeout(() => setShareFeedback(null), 2000);
      } catch {
        /* ignore */
      }
    }
  }

  if (sorted.length === 0) {
    const title = waitlisted ? t.roomList.noMatchTitle : t.roomList.emptyTitle;
    const subtitle = waitlisted ? t.roomList.noMatchSubtitle : t.roomList.emptySubtitle;

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sea-50">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-sea-500"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
        </div>
        <p className="font-display text-sm font-bold text-ink">{title}</p>
        <p className="max-w-xs text-sm text-ink-muted">{subtitle}</p>
        {waitlisted && (
          <button
            type="button"
            onClick={handleShare}
            className="mt-2 rounded-full border border-sea-200 bg-white px-4 py-2 text-xs font-semibold text-sea-700 transition hover:bg-sea-50"
          >
            {shareFeedback ?? t.roomList.shareCta}
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col bg-bg">
      <header className="border-b border-sea-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
        <h2 className="font-display text-sm font-bold text-ink">
          {t.roomList.title}
        </h2>
        <p className="text-xs text-ink-muted">
          {sorted.length} {t.roomList.resultsSuffix}
        </p>
      </header>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {sorted.map((room, index) => (
          <div
            key={room.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <RoomCard room={room} />
          </div>
        ))}
      </div>
    </section>
  );
}
