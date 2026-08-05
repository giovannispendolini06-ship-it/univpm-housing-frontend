import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { updateUserProfile } from "../actions";
import SubmitButton from "@/components/SubmitButton";
import DeleteUserButton from "../DeleteUserButton";

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

  // --- Solo per i proprietari: margine aggregato sui loro immobili,
  // visibile solo qui, mai nel loro account personale. ---------------------
  let ownerSummary: { totalPaidToOwner: number; totalFromStudents: number; margin: number } | null = null;

  if (person.role === "owner") {
    const { data: ownerProperties } = await db
      .from("properties")
      .select("monthly_rent_to_owner, rooms(price_monthly, is_available)")
      .eq("owner_id", id);

    const totalPaidToOwner = (ownerProperties ?? []).reduce(
      (sum, p) => sum + Number(p.monthly_rent_to_owner),
      0,
    );
    const totalFromStudents = (ownerProperties ?? []).reduce((sum, p) => {
      const occupiedRevenue = (p.rooms ?? [])
        .filter((r: { is_available: boolean }) => !r.is_available)
        .reduce((s: number, r: { price_monthly: number }) => s + Number(r.price_monthly), 0);
      return sum + occupiedRevenue;
    }, 0);

    ownerSummary = {
      totalPaidToOwner,
      totalFromStudents,
      margin: totalFromStudents - totalPaidToOwner,
    };
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <a
          href="/admin/users"
          className="mb-4 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Torna alle persone
        </a>

        <div className="mb-6 flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">
            Modifica {person.full_name}
          </h1>
          <DeleteUserButton userId={person.id} fullName={person.full_name} role={person.role} />
        </div>

        {ownerSummary && (
          <div className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-display text-sm font-bold text-ink">
              Margine su tutti i suoi immobili
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[11px] text-ink-muted">Incasso da studenti</p>
                <p className="mt-0.5 font-display text-base font-bold text-ink">
                  {ownerSummary.totalFromStudents}€
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Pagato a lui/lei</p>
                <p className="mt-0.5 font-display text-base font-bold text-ink">
                  {ownerSummary.totalPaidToOwner}€
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Margine</p>
                <p
                  className={`mt-0.5 font-display text-base font-bold ${ownerSummary.margin >= 0 ? "text-sea-700" : "text-sunset-600"}`}
                >
                  {ownerSummary.margin}€
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ink-muted">
              Visibile solo qui — non compare mai nel suo account personale.
            </p>
          </div>
        )}

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
