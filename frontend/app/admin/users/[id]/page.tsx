import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { updateUserProfile } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
  const { data: person } = await db.from("users").select("*").eq("id", id).single();

  if (!person) notFound();

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <a
          href="/admin/users"
          className="mb-4 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Torna alle persone
        </a>

        <h1 className="mb-6 font-display text-2xl font-bold text-ink">
          Modifica {person.full_name}
        </h1>

        <form action={updateUserProfile} className="space-y-4 rounded-xl2 bg-surface p-5 shadow-card">
          <input type="hidden" name="user_id" value={person.id} />

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-sea-50">
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
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Sostituisci foto
              </label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="text-xs text-ink-muted file:mr-2 file:rounded-full file:border-0 file:bg-sea-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sea-700"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Nome e cognome *
            </label>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={person.full_name ?? ""}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Email
            </label>
            <input
              type="email"
              value={person.email}
              disabled
              className="w-full rounded-xl border border-sea-100 bg-bg px-3 py-2 text-sm text-ink-muted"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              L&apos;email non è modificabile da qui (è legata al login).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Telefono
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={person.phone ?? ""}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Codice fiscale / P.IVA
            </label>
            <input
              type="text"
              name="fiscal_code"
              defaultValue={person.fiscal_code ?? ""}
              className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm uppercase focus:border-sea-400 focus:outline-none"
            />
          </div>

          {person.role === "student" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Data di nascita
              </label>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={person.date_of_birth ?? ""}
                className="w-full rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
              />
            </div>
          )}

          <SubmitButton className="w-full rounded-full bg-sea-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
            Salva modifiche
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
