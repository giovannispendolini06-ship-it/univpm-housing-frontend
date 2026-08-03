import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  student: "Studente",
  owner: "Proprietario",
  admin: "Admin",
};

const ROLE_STYLES: Record<string, string> = {
  student: "bg-sea-50 text-sea-700",
  owner: "bg-sunset-500/15 text-sunset-600",
  admin: "bg-ink text-white",
};

export default async function AdminUsersPage() {
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
  const { data: users } = await db
    .from("users")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Persone
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {users?.length ?? 0} tra studenti e proprietari registrati
          </p>
        </header>

        {!users || users.length === 0 ? (
          <p className="rounded-xl2 bg-surface p-6 text-sm text-ink-muted shadow-card">
            Nessuno si è ancora registrato.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {users.map((person) => (
              <article
                key={person.id}
                className="flex gap-3 rounded-xl2 bg-surface p-4 shadow-card"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-sea-50">
                  {person.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.avatar_url}
                      alt={person.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-sea-400">
                      {person.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-sm font-bold text-ink">
                      {person.full_name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLES[person.role] ?? ""}`}
                    >
                      {ROLE_LABELS[person.role] ?? person.role}
                    </span>
                  </div>
                  <p className="truncate text-xs text-ink-muted">{person.email}</p>
                  <div className="mt-1.5 space-y-0.5 text-[11px] text-ink-muted">
                    <p>📞 {person.phone || "non fornito"}</p>
                    <p>🪪 {person.fiscal_code || "non fornito"}</p>
                    {person.role === "student" && (
                      <p>
                        🎂{" "}
                        {person.date_of_birth
                          ? new Date(person.date_of_birth).toLocaleDateString("it-IT")
                          : "non fornita"}
                      </p>
                    )}
                    <p>
                      {person.profile_completed ? "✓ Profilo completo" : "⏳ Profilo incompleto"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
