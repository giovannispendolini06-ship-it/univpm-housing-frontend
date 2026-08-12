"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { trackFunnel } from "@/lib/analytics";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";
import type { ChatProgress, ChatProgressStepKey } from "@/lib/chat-progress";
import { CHAT_PROGRESS_TOTAL } from "@/lib/chat-progress";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import VestaAvatar from "./VestaAvatar";

const VESTA_STARTED_KEY = "coabito_vesta_started";
const VESTA_COMPLETED_KEY = "coabito_vesta_completed";
const VESTA_ABANDONED_KEY = "coabito_vesta_abandoned";

interface ChatPanelProps {
  initialMessages: ChatMessage[];
  initialProgress?: ChatProgress | null;
  onSendMessage: (
    text: string,
    history: { role: ChatMessage["role"]; content: string }[],
  ) => Promise<{
    reply: string;
    rooms?: RecommendedRoom[];
    waitlisted?: boolean;
    progress?: ChatProgress;
  }>;
  onRoomsUpdate?: (rooms: RecommendedRoom[], waitlisted?: boolean) => void;
}

function stepLabel(
  key: ChatProgressStepKey | null,
  labels: Record<ChatProgressStepKey, string>,
): string | null {
  if (!key) return null;
  return labels[key] ?? null;
}

function markVestaStarted() {
  try {
    if (sessionStorage.getItem(VESTA_STARTED_KEY)) return;
    sessionStorage.setItem(VESTA_STARTED_KEY, "1");
    trackFunnel("vesta_chat_started");
  } catch {
    trackFunnel("vesta_chat_started");
  }
}

function markVestaCompleted(reason: string) {
  try {
    if (sessionStorage.getItem(VESTA_COMPLETED_KEY)) return;
    sessionStorage.setItem(VESTA_COMPLETED_KEY, "1");
    trackFunnel("vesta_chat_completed", { reason });
  } catch {
    trackFunnel("vesta_chat_completed", { reason });
  }
}

export default function ChatPanel({
  initialMessages,
  initialProgress = null,
  onSendMessage,
  onRoomsUpdate,
}: ChatPanelProps) {
  const { t } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState<ChatProgress | null>(initialProgress);
  const scrollRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!initialProgress) return;
    setProgress((prev) => {
      if (!prev || initialProgress.done >= prev.done) return initialProgress;
      return prev;
    });
  }, [initialProgress]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Abbandono: utente ha iniziato ma non completato e lascia la pagina.
  useEffect(() => {
    function maybeAbandon() {
      try {
        const started = sessionStorage.getItem(VESTA_STARTED_KEY);
        const completed = sessionStorage.getItem(VESTA_COMPLETED_KEY);
        const abandoned = sessionStorage.getItem(VESTA_ABANDONED_KEY);
        if (started && !completed && !abandoned) {
          sessionStorage.setItem(VESTA_ABANDONED_KEY, "1");
          trackFunnel("vesta_chat_abandoned");
        }
      } catch {
        /* ignore */
      }
    }

    window.addEventListener("pagehide", maybeAbandon);
    return () => window.removeEventListener("pagehide", maybeAbandon);
  }, []);

  useEffect(() => {
    if (completedRef.current) return;
    if (progress && progress.done >= progress.total) {
      completedRef.current = true;
      markVestaCompleted("profile_complete");
    }
  }, [progress]);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;

    markVestaStarted();

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
      const { reply, rooms, waitlisted, progress: nextProgress } =
        await onSendMessage(text, historyForApi);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (nextProgress) setProgress(nextProgress);
      if (rooms) onRoomsUpdate?.(rooms, waitlisted);
      if (waitlisted) {
        trackFunnel("waitlist_signup_completed", { source: "vesta_chat" });
        if (!completedRef.current) {
          completedRef.current = true;
          markVestaCompleted("waitlisted");
        }
      }
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

  const done = progress?.done ?? 0;
  const total = progress?.total ?? CHAT_PROGRESS_TOTAL;
  const pct = Math.round((done / total) * 100);
  const currentLabel = stepLabel(progress?.current ?? null, t.chat.progressSteps);
  const progressText =
    done >= total
      ? t.chat.progressComplete
      : t.chat.progressLabel
          .replace("{done}", String(done))
          .replace("{total}", String(total))
          .replace("{step}", currentLabel ?? "");

  return (
    <section className="flex h-full flex-col bg-bg">
      <header className="border-b border-sea-100 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <VestaAvatar size={36} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-sm font-bold text-ink">Vesta</h1>
            <p className="text-xs text-ink-muted">{t.chat.subtitle}</p>
          </div>
        </div>

        <div className="mt-2.5" aria-live="polite">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium text-sea-700">
              {progressText}
            </p>
            <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
              {done}/{total}
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-sea-100"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={progressText}
          >
            <div
              className="h-full rounded-full bg-sea-600 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <div className="border-t border-sea-100 bg-white p-3">
        <div className="flex items-end gap-2 rounded-xl2 border border-sea-100 bg-bg px-3 py-2 focus-within:border-sea-400">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.inputPlaceholder}
            className="max-h-28 flex-1 resize-none bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label={t.chat.sendLabel}
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
