import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import ChatBubble from "@/components/ChatBubble";
import type { ChatMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

const POLO_LABELS: Record<string, string> = {
  monte_dago: "Monte Dago / Tavernelle",
  torrette: "Torrette",
  centro_economia_giurisprudenza: "Centro / Villarey",
  altro: "Altro",
};

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminProfile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") redirect("/dashboard");

  const db = createServiceSupabaseClient();

  const [{ data: person }, { data: studentProfile }, { data: messages }, { data: waitlist }] =
    await Promise.all([
      db.from("users").select("*").eq("id", studentId).maybeSingle(),
      db.from("student_profiles").select("*").eq("user_id", studentId).maybeSingle(),
      db
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true }),
      db
        .from("waitlist_signups")
        .select("id")
        .eq("user_id", studentId)
        .maybeSingle(),
    ]);

  if (!person) notFound();

  const { count: matchCount } = await db
    .from("match_scores")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId);

  const chatMessages: ChatMessage[] = (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role as ChatMessage["role"],
    content: m.content,
    createdAt: m.created_at,
  }));

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/conversations"
          className="mb-4 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Torna alle conversazioni
        </Link>

        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">{person.full_name}</h1>
          <p className="text-sm text-ink-muted">{person.email}</p>
          {person.phone && (
            <p className="text-sm text-ink-muted">Tel: {person.phone}</p>
          )}
        </header>

        <section className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-sm font-bold text-ink">Profilo studente</h2>
          {studentProfile ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">Facoltà</dt>
                <dd>{studentProfile.degree_course ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Polo</dt>
                <dd>
                  {studentProfile.polo_univpm
                    ? (POLO_LABELS[studentProfile.polo_univpm] ?? studentProfile.polo_univpm)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Budget max</dt>
                <dd>
                  {studentProfile.budget_max != null
                    ? `${studentProfile.budget_max}€/mese`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Abitudini</dt>
                <dd className="text-xs text-ink-muted">
                  Studio: {studentProfile.study_habit ?? "—"} · Socievolezza:{" "}
                  {studentProfile.sociability_level ?? "—"}/5 · Ospiti:{" "}
                  {studentProfile.guests_frequency ?? "—"} · Pulizia:{" "}
                  {studentProfile.cleanliness_level ?? "—"}/5
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-ink-muted">Profilo non ancora compilato.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-sea-50 px-2 py-0.5 text-sea-700">
              Match: {(matchCount ?? 0) > 0 ? "Sì" : "No"}
            </span>
            <span className="rounded-full bg-sea-50 px-2 py-0.5 text-sea-700">
              Lista d&apos;attesa: {waitlist ? "Sì" : "No"}
            </span>
          </div>
        </section>

        <section className="rounded-xl2 bg-surface p-4 shadow-card sm:p-5">
          <details>
            <summary className="cursor-pointer font-display text-sm font-bold text-ink">
              Cronologia chat ({chatMessages.length} messaggi)
            </summary>
            <div className="mt-4 space-y-3 border-t border-sea-100 pt-4">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-ink-muted">Nessun messaggio.</p>
              ) : (
                chatMessages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))
              )}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
