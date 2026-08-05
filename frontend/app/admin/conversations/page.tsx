import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ConversationRow {
  studentId: string;
  fullName: string;
  email: string;
  lastMessageAt: string;
  hasMatches: boolean;
  onWaitlist: boolean;
  status: "Con match" | "Lista d'attesa" | "In corso";
}

const STATUS_STYLES: Record<ConversationRow["status"], string> = {
  "Con match": "bg-sea-600 text-white",
  "Lista d'attesa": "bg-sunset-500 text-white",
  "In corso": "bg-sand-400/20 text-ink",
};

export default async function AdminConversationsPage() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const db = createServiceSupabaseClient();

  const { data: messages } = await db
    .from("chat_messages")
    .select("student_id, created_at")
    .order("created_at", { ascending: false });

  const studentIds = Array.from(new Set((messages ?? []).map((m) => m.student_id)));

  if (studentIds.length === 0) {
    return (
      <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-ink">Conversazioni</h1>
          <p className="mt-6 rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessuna conversazione ancora.
          </p>
        </div>
      </main>
    );
  }

  const [{ data: users }, { data: waitlistRows }, { data: matchRows }] = await Promise.all([
    db.from("users").select("id, full_name, email").in("id", studentIds),
    db.from("waitlist_signups").select("user_id").in("user_id", studentIds),
    db.from("match_scores").select("student_id").in("student_id", studentIds),
  ]);

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));
  const waitlistSet = new Set((waitlistRows ?? []).map((w) => w.user_id));
  const matchSet = new Set((matchRows ?? []).map((m) => m.student_id));

  const lastMessageByStudent = new Map<string, string>();
  for (const msg of messages ?? []) {
    if (!lastMessageByStudent.has(msg.student_id)) {
      lastMessageByStudent.set(msg.student_id, msg.created_at);
    }
  }

  const rows: ConversationRow[] = studentIds
    .map((studentId) => {
      const person = usersById.get(studentId);
      const hasMatches = matchSet.has(studentId);
      const onWaitlist = waitlistSet.has(studentId);
      let status: ConversationRow["status"] = "In corso";
      if (hasMatches) status = "Con match";
      else if (onWaitlist) status = "Lista d'attesa";

      return {
        studentId,
        fullName: person?.full_name ?? "Studente",
        email: person?.email ?? "",
        lastMessageAt: lastMessageByStudent.get(studentId) ?? "",
        hasMatches,
        onWaitlist,
        status,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Conversazioni</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Studenti che hanno chattato con Vesta — stato match, lista d&apos;attesa e cronologia.
          </p>
        </header>

        <div className="space-y-2">
          {rows.map((row) => (
            <Link
              key={row.studentId}
              href={`/admin/conversations/${row.studentId}`}
              className="flex items-center justify-between gap-3 rounded-xl2 bg-surface p-4 shadow-card transition hover:shadow-lg"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-ink">
                  {row.fullName}
                </p>
                <p className="truncate text-xs text-ink-muted">{row.email}</p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  Ultimo messaggio:{" "}
                  {row.lastMessageAt
                    ? new Date(row.lastMessageAt).toLocaleString("it-IT")
                    : "—"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[row.status]}`}
              >
                {row.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
