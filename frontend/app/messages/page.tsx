import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { listConversationsForUser } from "@/lib/data/messages";
import StudentShell from "@/components/student/StudentShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messaggi | Coabito",
  description: "Conversazioni con proprietari e studenti dopo una candidatura accettata.",
};

export default async function MessagesPage() {
  const session = await requireSession();
  const db = createServiceSupabaseClient();

  let conversations: Awaited<ReturnType<typeof listConversationsForUser>>["data"] = [];
  let loadError: string | null = null;

  try {
    const { data, error } = await listConversationsForUser(db, session.id);
    if (error) {
      loadError =
        error.message.includes("does not exist") || error.code === "42P01"
          ? null
          : error.message;
      conversations = data ?? [];
    } else {
      conversations = data ?? [];
    }
  } catch {
    conversations = [];
  }

  const isStudent = session.role === "student";
  const home =
    session.role === "owner"
      ? "/owner"
      : session.role === "admin"
        ? "/admin"
        : "/dashboard";

  const body = (
    <div className="px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Messaggi</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Thread con proprietari dopo una candidatura accettata. La chat con Vesta
          resta in <Link href="/dashboard" className="font-semibold text-sea-700 underline">Vesta</Link>.
        </p>
      </header>

      {loadError && (
        <p
          className="mb-4 rounded-xl2 border border-sunset-500/30 bg-white px-4 py-3 text-sm text-sunset-600"
          role="alert"
        >
          {loadError}
        </p>
      )}

      {!conversations?.length ? (
        <div className="rounded-xl2 bg-white px-4 py-10 text-center shadow-card">
          <p className="font-display font-bold text-ink">Nessuna conversazione ancora</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Quando una candidatura viene accettata, qui apparirà il thread con
            l&apos;altra parte.
          </p>
          {isStudent ? (
            <Link
              href="/applications"
              className="mt-5 inline-block rounded-full bg-sunset-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Le tue candidature
            </Link>
          ) : (
            <Link
              href={home}
              className="mt-5 inline-block rounded-full bg-sunset-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Area personale
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((row) => {
            const conv = Array.isArray(row.conversations)
              ? row.conversations[0]
              : row.conversations;
            return (
              <li
                key={String(row.conversation_id)}
                className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 text-sm shadow-card"
              >
                <p className="font-display font-bold text-ink">
                  Conversazione {(conv as { id?: string } | null)?.id?.slice(0, 8) ?? "—"}
                </p>
                <p className="text-xs text-ink-muted">
                  Aggiornata:{" "}
                  {(conv as { updated_at?: string } | null)?.updated_at ?? "—"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (isStudent) {
    return <StudentShell>{body}</StudentShell>;
  }

  return (
    <main className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <Link href={home} className="text-sm text-sea-700 underline">
          ← Area personale
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">{body}</div>
    </main>
  );
}
