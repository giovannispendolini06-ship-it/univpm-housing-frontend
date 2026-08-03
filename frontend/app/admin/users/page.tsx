import Link from "next/link";
import { redirect } from "next/navigation";
import { Phone, IdCard } from "lucide-react";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Person {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  fiscal_code: string | null;
  avatar_url: string | null;
  role: string;
}

function PersonCard({ person }: { person: Person }) {
  return (
    <Link
      href={`/admin/users/${person.id}`}
      className="flex gap-3 rounded-xl2 bg-surface p-4 shadow-card transition hover:shadow-lg"
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
        <h3 className="truncate font-display text-sm font-bold text-ink">
          {person.full_name}
        </h3>
        <p className="truncate text-xs text-ink-muted">{person.email}</p>
        <div className="mt-1.5 space-y-0.5 text-[11px] text-ink-muted">
          <p className="flex items-center gap-1.5">
            <Phone size={12} className="shrink-0 text-sea-500" />
            {person.phone || "non fornito"}
          </p>
          <p className="flex items-center gap-1.5">
            <IdCard size={12} className="shrink-0 text-sea-500" />
            {person.fiscal_code || "non fornito"}
          </p>
        </div>
      </div>
    </Link>
  );
}

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

  // --- Proprietari: tutti quelli registrati con questo ruolo -----------------
  const { data: owners } = await db
    .from("users")
    .select("*")
    .eq("role", "owner")
    .order("created_at", { ascending: false });

  // --- Affittuari: SOLO chi ha almeno una riga in room_tenancies, cioè chi ha
  // davvero affittato — non tutti gli studenti che si sono solo registrati --
  const { data: tenancies } = await db.from("room_tenancies").select("student_id");
  const tenantIds = Array.from(new Set((tenancies ?? []).map((t) => t.student_id)));

  const { data: tenants } =
    tenantIds.length > 0
      ? await db.from("users").select("*").in("id", tenantIds).order("created_at", { ascending: false })
      : { data: [] as Person[] };

  const { count: registeredStudentsCount } = await db
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const notYetTenants = (registeredStudentsCount ?? 0) - (tenants?.length ?? 0);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Persone
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Solo proprietari e studenti che hanno effettivamente affittato.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Proprietari ({owners?.length ?? 0})
          </h2>
          {!owners || owners.length === 0 ? (
            <p className="rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
              Nessun proprietario registrato ancora.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {owners.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Affittuari ({tenants?.length ?? 0})
          </h2>
          {!tenants || tenants.length === 0 ? (
            <p className="rounded-xl2 bg-surface p-5 text-sm text-ink-muted shadow-card">
              Nessuno ha ancora affittato nulla.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {tenants.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
          {notYetTenants > 0 && (
            <p className="mt-3 text-xs text-ink-muted">
              Ci sono anche {notYetTenants} studenti registrati che non hanno
              ancora affittato nulla — non mostrati qui per tenere la lista
              pulita.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
