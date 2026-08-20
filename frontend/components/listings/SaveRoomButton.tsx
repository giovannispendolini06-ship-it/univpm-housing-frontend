"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { isRoomSaved, toggleSavedRoom } from "@/lib/saved-rooms";

export default function SaveRoomButton({
  roomId,
  className = "",
}: {
  roomId: string;
  className?: string;
}) {
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isRoomSaved(roomId));
    function sync() {
      setSaved(isRoomSaved(roomId));
    }
    window.addEventListener("coabito:saved-rooms", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("coabito:saved-rooms", sync);
      window.removeEventListener("storage", sync);
    };
  }, [roomId]);

  return (
    <button
      type="button"
      onClick={() => {
        const next = toggleSavedRoom(roomId);
        setSaved(next);
        if (next) track("listing_saved", { room_id: roomId });
      }}
      aria-pressed={saved}
      aria-label={saved ? t.studentHome.unsaveAria : t.studentHome.saveAria}
      className={[
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
        saved
          ? "border-sunset-500 bg-sunset-500/10 text-sunset-600"
          : "border-sea-100 bg-white text-ink-muted hover:border-sea-200 hover:text-sea-700",
        className,
      ].join(" ")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
