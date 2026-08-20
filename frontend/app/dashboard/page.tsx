"use client";

import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import RoomList from "@/components/RoomList";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import LoadingRing from "@/components/LoadingRing";
import MyHomeCard, { type MyTenancy } from "@/components/MyHomeCard";
import MyPaymentsSection from "@/components/MyPaymentsSection";
import StudentShell from "@/components/student/StudentShell";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";
import {
  computeChatProgressFromProfile,
  type ChatProgress,
} from "@/lib/chat-progress";
import { useLocale } from "@/lib/i18n/LocaleContext";
import VerificationPanel from "@/components/VerificationPanel";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { VerificationStatus } from "@/lib/verification";
import Link from "next/link";

type MobileTab = "chat" | "rooms";

const WELCOME_MESSAGES: Record<"it" | "en", string> = {
  it: "Ehi! 👋 Sono Vesta, ti aiuto a trovare casa qui ad Ancona. <QUESTION>Che facoltà fai?</QUESTION>",
  en: "Hey! 👋 I'm Vesta, I'll help you find a place here in Ancona. <QUESTION>What are you studying?</QUESTION>",
};

/**
 * Student home: Vesta chat + matched rooms.
 * Navigation lives in StudentShell (not floating pills).
 * chat_messages loaded scoped to student_id, ordered by created_at ASC.
 */
export default function StudentDashboardPage() {
  const { locale, t } = useLocale();
  const welcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: WELCOME_MESSAGES[locale],
    createdAt: new Date().toISOString(),
  };

  const [activeTab, setActiveTab] = useState<MobileTab>("chat");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("none");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RecommendedRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [waitlisted, setWaitlisted] = useState(false);
  const [myTenancy, setMyTenancy] = useState<MyTenancy | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | null>(null);
  const [chatProgress, setChatProgress] = useState<ChatProgress | null>(null);

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id ?? null;
      setStudentId(userId);

      if (!userId) {
        setInitialMessages([welcomeMessage]);
        return;
      }

      supabase
        .from("users")
        .select("role, email, verification_status")
        .eq("id", userId)
        .single()
        .then(({ data: profile }) => {
          setIsAdmin(profile?.role === "admin");
          setVerificationStatus(profile?.verification_status ?? "none");
          setUserEmail(profile?.email ?? null);
        });

      // Scoped to this student only; chronological thread (no session_id in schema)
      supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("student_id", userId)
        .order("created_at", { ascending: true })
        .then(({ data: history, error }) => {
          if (error) {
            console.error("Errore nel caricamento della cronologia chat:", error);
            setInitialMessages([welcomeMessage]);
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
            setInitialMessages([welcomeMessage]);
          }
        });

      supabase
        .from("student_profiles")
        .select(
          "campus_id, degree_course, budget_max, preferred_move_in_date, study_habit, sociability_level, guests_frequency, cleanliness_level, is_smoker, has_pets",
        )
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data: profile }) => {
          setChatProgress(computeChatProgressFromProfile(profile));
        });

      fetch(`/api/my-tenancy?studentId=${userId}`)
        .then((res) => (res.ok ? res.json() : { tenancy: null }))
        .then((data) => setMyTenancy(data.tenancy ?? null))
        .catch(() => setMyTenancy(null));
    });
    // welcomeMessage is locale-stable for this mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;

    setRoomsLoading(true);
    fetch(`/api/matches?studentId=${studentId}&locale=${locale}`)
      .then((res) => (res.ok ? res.json() : { rooms: [] }))
      .then((data) => {
        setRooms(data.rooms ?? []);
        setWaitlisted(Boolean(data.waitlisted));
      })
      .catch(() => {
        setRooms([]);
        setWaitlisted(false);
      })
      .finally(() => setRoomsLoading(false));

    fetch("/api/sync-locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, locale }),
    }).catch(() => {});
  }, [studentId, locale]);

  async function handleSendMessage(
    text: string,
    history: { role: ChatMessage["role"]; content: string }[],
  ): Promise<{
    reply: string;
    rooms?: RecommendedRoom[];
    waitlisted?: boolean;
    progress?: ChatProgress;
  }> {
    if (!studentId) {
      return {
        reply:
          locale === "en"
            ? "You need to log in to talk to me — reload the page."
            : "Devi effettuare il login per parlare con me — ricarica la pagina.",
      };
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, message: text, history, locale }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        reply:
          data?.error ??
          (locale === "en"
            ? "Something went wrong on my end, try again shortly."
            : "Qualcosa è andato storto dal mio lato, riprova tra poco."),
      };
    }

    const data = await res.json();
    if (data.waitlisted) setWaitlisted(true);
    if (data.progress) setChatProgress(data.progress);
    return {
      reply: data.reply,
      rooms: data.rooms,
      waitlisted: data.waitlisted,
      progress: data.progress,
    };
  }

  function handleRoomsUpdate(updatedRooms: RecommendedRoom[], isWaitlisted?: boolean) {
    setRooms(updatedRooms);
    if (isWaitlisted !== undefined) setWaitlisted(isWaitlisted);
  }

  return (
    <StudentShell fillHeight>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {isAdmin && (
          <div className="shrink-0 px-3 pt-2 sm:px-4">
            <Link
              href="/admin"
              className="inline-flex rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
            >
              Admin
            </Link>
          </div>
        )}

        {studentId && !isAdmin && (
          <div className="shrink-0 px-3 pt-3 sm:px-4">
            <div className="mb-2 flex items-center gap-2">
              <VerifiedBadge
                status={verificationStatus as VerificationStatus}
                role="student"
              />
            </div>
            <VerificationPanel
              role="student"
              status={verificationStatus as VerificationStatus}
              email={userEmail}
            />
          </div>
        )}

        {myTenancy && <MyHomeCard tenancy={myTenancy} />}
        {studentId && myTenancy && <MyPaymentsSection studentId={studentId} />}

        <div className="flex shrink-0 border-b border-sea-100 bg-white md:hidden">
          <TabButton
            label={t.dashboard.chatTab}
            isActive={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />
          <TabButton
            label={`${t.dashboard.roomsTab} (${rooms.length})`}
            isActive={activeTab === "rooms"}
            onClick={() => setActiveTab("rooms")}
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,420px)_1fr]">
          <div
            className={`${
              activeTab === "chat" ? "flex" : "hidden"
            } min-h-0 flex-col md:flex md:border-r md:border-sea-100`}
          >
            {initialMessages ? (
              <ChatPanel
                initialMessages={initialMessages}
                initialProgress={chatProgress}
                onSendMessage={handleSendMessage}
                onRoomsUpdate={handleRoomsUpdate}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <LoadingRing size={36} />
                <p className="text-sm text-ink-muted">{t.dashboard.loadingChat}</p>
              </div>
            )}
          </div>

          <div
            className={`${
              activeTab === "rooms" ? "block" : "hidden"
            } min-h-0 overflow-y-auto md:block`}
          >
            <div className="hidden border-b border-sea-100 bg-white px-4 py-3 md:block">
              <h2 className="font-display text-sm font-bold text-ink">
                {t.dashboard.roomsTab}
              </h2>
              <p className="text-xs text-ink-muted">
                {locale === "en"
                  ? "Rooms matched from your chat with Vesta"
                  : "Stanze proposte dalla chat con Vesta"}
              </p>
            </div>
            <RoomList rooms={rooms} waitlisted={waitlisted} loading={roomsLoading} />
          </div>
        </div>

        {!isAdmin && (
          <div className="hidden px-4 py-2 md:block">
            <DeleteAccountButton
              className="text-[10px] text-ink-muted underline underline-offset-2 transition hover:text-sunset-600"
              labels={{
                buttonLabel: t.common.deleteAccount,
                deletingLabel: t.common.deletingAccount,
                warningStudent: t.common.deleteAccountWarningStudent,
                warningOwner: t.common.deleteAccountWarningOwner,
                confirmAgain: t.common.deleteAccountConfirm,
              }}
            />
          </div>
        )}
      </div>
    </StudentShell>
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
