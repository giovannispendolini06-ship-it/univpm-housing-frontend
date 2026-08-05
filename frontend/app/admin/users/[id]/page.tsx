import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { updateUserProfile } from "../actions";
import SubmitButton from "@/components/SubmitButton";
import DeleteUserButton from "../DeleteUserButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

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

  const whatsappLink = person.phone
    ? buildWhatsAppLink(
        person.phone,
        `Ciao ${person.full_name?.split(" ")[0] ?? ""}, sono Giovanni di Coabito.`,
      )
    : null;

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
          <div className="flex shrink-0 items-center gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.25 8.25a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25M8.5 6.75c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.47-.28-.24-.13-1.44-.71-1.66-.79-.22-.08-.39-.13-.55.13-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.13-1.03-.38-1.96-1.2-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.55-1.35-.77-1.84-.2-.48-.4-.42-.55-.42h-.15"/>
                </svg>
                WhatsApp
              </a>
            )}
            <DeleteUserButton userId={person.id} fullName={person.full_name} role={person.role} />
          </div>
        </div>

        {ownerSummary && (
          <div className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-display text-sm font-bold text-ink">
              Margine su tutti i suoi immobili
            </h2>
            <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
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
