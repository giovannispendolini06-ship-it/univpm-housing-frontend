"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import RoomList from "@/components/RoomList";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import LoadingRing from "@/components/LoadingRing";
import MyHomeCard, { type MyTenancy } from "@/components/MyHomeCard";
import MyPaymentsSection from "@/components/MyPaymentsSection";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { ChatMessage, RecommendedRoom } from "@/lib/types";
import {
  computeChatProgressFromProfile,
  type ChatProgress,
} from "@/lib/chat-progress";
import { useLocale } from "@/lib/i18n/LocaleContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import VerificationPanel from "@/components/VerificationPanel";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { VerificationStatus } from "@/lib/verification";

type MobileTab = "chat" | "rooms";

const WELCOME_MESSAGES: Record<"it" | "en", string> = {
  it: "Ehi! 👋 Sono Vesta, ti aiuto a trovare casa qui ad Ancona. Che facoltà fai?",
  en: "Hey! 👋 I'm Vesta, I'll help you find a place here in Ancona. What are you studying?",
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
 * Al primo caricamento, ricarica dal database la conversazione con Vesta
 * e le stanze già calcolate (invece di ripartire sempre da zero): due
 * semplici query indicizzate, nessuna chiamata a OpenAI, quindi resta
 * leggero e veloce anche per chi torna il giorno dopo.
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
  // null = ancora in caricamento: evita di mostrare per un istante il
  // messaggio di benvenuto e poi "saltare" alla cronologia vera.
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

      // Ruolo + badge verifica marketplace
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

      // Progresso iniziale dal profilo già salvato (se la chat era stata chiusa).
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

      // Se lo studente ha già un affitto attivo, mostra subito affitto +
      // utenze + stato del pagamento — la prima cosa che deve vedere
      // aprendo il sito, non qualcosa da andare a cercare.
      fetch(`/api/my-tenancy?studentId=${userId}`)
        .then((res) => (res.ok ? res.json() : { tenancy: null }))
        .then((data) => setMyTenancy(data.tenancy ?? null))
        .catch(() => setMyTenancy(null));
    });
  }, []);

  // Stanze già calcolate in precedenza: così non serve riscrivere a Vesta
  // solo per rivederle. Effetto separato (non dentro quello sopra) perché
  // deve rifarsi da solo se la lingua cambia dopo il primo caricamento —
  // il resto (auth, storico chat) non deve invece ripartire ogni volta.
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

    // Salva la lingua sul profilo: serve alle azioni lato server (nuova
    // stanza, nuovo affitto) che non possono leggere il cookie del
    // browser. Fallisce in silenzio: non è mai bloccante per lo studente.
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
    <main className="relative flex h-dvh flex-col bg-bg">
      <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <VerifiedBadge
            status={verificationStatus as VerificationStatus}
            role="student"
          />
          <LanguageSwitcher />
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-card"
            >
              Admin
            </Link>
          )}
          {!isAdmin && (
            <>
              <Link
                href="/stanze"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card"
              >
                Stanze
              </Link>
              <Link
                href="/applications"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card"
              >
                Candidature
              </Link>
              <Link
                href="/messages"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card"
              >
                Messaggi
              </Link>
              <Link
                href="/profilo"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card"
              >
                Profilo
              </Link>
            </>
          )}
          <SignOutButton
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted shadow-card"
            label={t.common.signOut}
          />
        </div>
        <DeleteAccountButton
          className="rounded-full bg-white/70 px-2 py-1 text-[10px] text-ink-muted underline underline-offset-2 transition hover:text-sunset-600"
          labels={{
            buttonLabel: t.common.deleteAccount,
            deletingLabel: t.common.deletingAccount,
            warningStudent: t.common.deleteAccountWarningStudent,
            warningOwner: t.common.deleteAccountWarningOwner,
            confirmAgain: t.common.deleteAccountConfirm,
          }}
        />
      </div>

      {studentId && !isAdmin && (
        <div className="mx-auto w-full max-w-7xl shrink-0 px-3 pt-14 md:px-4">
          <VerificationPanel
            role="student"
            status={verificationStatus as VerificationStatus}
            email={userEmail}
          />
        </div>
      )}

      {myTenancy && <MyHomeCard tenancy={myTenancy} />}
      {studentId && myTenancy && <MyPaymentsSection studentId={studentId} />}

      {/* Tab bar solo mobile */}
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

      <div className="mx-auto grid w-full min-h-0 max-w-7xl flex-1 grid-cols-1 md:grid-cols-[minmax(320px,420px)_1fr]">
        <div
          className={`${activeTab === "chat" ? "block" : "hidden"} h-full min-h-0 md:block md:border-r md:border-sea-100`}
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

        <div className={`${activeTab === "rooms" ? "block" : "hidden"} h-full min-h-0 md:block`}>
          <RoomList rooms={rooms} waitlisted={waitlisted} loading={roomsLoading} />
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
