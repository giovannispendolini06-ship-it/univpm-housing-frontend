import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getLifestyleProfile } from "@/lib/data/profiles";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { VerificationStatus } from "@/lib/verification";
import StudentShell from "@/components/student/StudentShell";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Il tuo profilo | Coabito",
};

export default async function ProfiloPage() {
  const session = await requireSession();
  const db = createServiceSupabaseClient();

  const { data: user } = await db
    .from("users")
    .select(
      "full_name, email, phone, avatar_url, fiscal_code, date_of_birth, verification_status, role",
    )
    .eq("id", session.id)
    .single();

  const lifestyle =
    session.role === "student"
      ? (await getLifestyleProfile(db, session.id)).data
      : null;

  const home =
    session.role === "owner"
      ? "/owner"
      : session.role === "admin"
        ? "/admin"
        : "/dashboard";

  const isStudent = session.role === "student";

  const body = (
    <div className="px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Il tuo profilo</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Dati account e preferenze raccolte con Vesta.
        </p>
      </header>

      <section className="rounded-xl2 bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sea-50">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-sea-700">
                {(user?.full_name ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-bold text-ink">
                {user?.full_name ?? "Utente"}
              </p>
              <VerifiedBadge
                status={(user?.verification_status as VerificationStatus) ?? "none"}
                role={session.role === "owner" ? "owner" : "student"}
              />
            </div>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <p className="text-xs capitalize text-ink-muted">{session.role}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-bg pt-4 text-sm">
          <div>
            <dt className="text-xs text-ink-muted">Telefono</dt>
            <dd className="font-medium text-ink">{user?.phone ?? "—"}</dd>
          </div>
          {session.role === "student" && (
            <div>
              <dt className="text-xs text-ink-muted">Data di nascita</dt>
              <dd className="font-medium text-ink">{user?.date_of_birth ?? "—"}</dd>
            </div>
          )}
        </dl>
      </section>

      {lifestyle && (
        <section className="mt-4 rounded-xl2 bg-white p-5 shadow-card">
          <h2 className="font-display text-sm font-bold text-ink">
            Preferenze casa (Compatibilità Coabito)
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-muted">Budget max</dt>
              <dd className="font-medium text-ink">
                {lifestyle.budget_max != null ? `${lifestyle.budget_max}€` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Ingresso preferito</dt>
              <dd className="font-medium text-ink">
                {lifestyle.preferred_move_in_date ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Polo</dt>
              <dd className="font-medium text-ink">{lifestyle.polo_univpm ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Ordine (1–5)</dt>
              <dd className="font-medium text-ink">
                {lifestyle.cleanliness_level ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Fumo</dt>
              <dd className="font-medium text-ink">
                {lifestyle.is_smoker ? "Fumo" : "Non fumo"}
                {lifestyle.tolerates_smokers === false ? " · no-smoke casa" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Animali</dt>
              <dd className="font-medium text-ink">
                {lifestyle.has_pets ? "Sì" : "No"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-muted">
            Per aggiornare le preferenze, continua la chat con Vesta: aggiorna
            Compatibilità Coabito senza ripetere l&apos;onboarding.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-semibold text-sea-700 underline"
          >
            Apri Vesta →
          </Link>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-sea-100 pt-6">
        <SignOutButton className="rounded-full bg-sea-50 px-4 py-2 text-sm font-semibold text-ink" />
        <DeleteAccountButton
          isOwner={session.role === "owner"}
          className="text-xs text-ink-muted underline underline-offset-2 hover:text-sunset-600"
        />
        {!isStudent && (
          <Link href={home} className="text-sm text-sea-700 underline">
            ← Area personale
          </Link>
        )}
      </div>
    </div>
  );

  if (isStudent) {
    return <StudentShell>{body}</StudentShell>;
  }

  return <main className="min-h-dvh bg-bg">{body}</main>;
}
