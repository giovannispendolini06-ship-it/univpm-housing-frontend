import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import StudentShell from "@/components/student/StudentShell";
import GroupMembershipButton from "@/components/community/GroupMembershipButton";
import {
  ensureCommunityAutoJoin,
  listCommunityGroupsForUser,
} from "@/lib/data/community";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community | Coabito",
  robots: { index: false, follow: false },
};

export default async function CommunityPage() {
  const session = await requireSession();
  if (session.role !== "student") {
    redirect(session.role === "owner" ? "/owner" : "/dashboard");
  }

  const db = createServiceSupabaseClient();
  const auto = await ensureCommunityAutoJoin(db, session.id);
  const groups = await listCommunityGroupsForUser(db, session.id);
  const mine = groups.filter((g) => g.isMember);
  const discover = groups.filter((g) => !g.isMember);

  return (
    <StudentShell>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sea-700">
            Prima della casa
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">Community</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Gruppi per città e università: tip, quartieri e coinquilini — anche
            mesi prima di trasferirti. La ricerca stanze resta su{" "}
            <Link href="/stanze" className="font-semibold text-sea-700 underline">
              Stanze
            </Link>
            .
          </p>
          {auto.citySlug ? (
            <p className="mt-2 text-xs text-sea-700">
              Profilo: {auto.citySlug}
              {auto.universitySlug ? ` · ${auto.universitySlug}` : ""}
              {auto.joined.length > 0
                ? ` — ti abbiamo proposto ${auto.joined.length} grupp${auto.joined.length === 1 ? "o" : "i"}.`
                : null}
            </p>
          ) : (
            <p className="mt-2 text-xs text-sunset-600">
              Completa città (e università) con Vesta o nel profilo per entrare
              automaticamente nei gruppi giusti.
            </p>
          )}
        </header>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm font-bold text-ink">
            I tuoi gruppi
          </h2>
          {mine.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-sea-200 bg-white px-4 py-8 text-center">
              <p className="text-sm text-ink-muted">
                Non sei ancora in nessun gruppo. Completa il profilo o unisciti
                qui sotto.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {mine.map((g) => (
                <li
                  key={g.id}
                  className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/community/${g.id}`}
                        className="font-display text-base font-bold text-ink hover:text-sea-700"
                      >
                        {g.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {g.city}
                        {g.university ? ` · ${g.university}` : " · tutta la città"}
                        {" · "}
                        {g.memberCount} membr{g.memberCount === 1 ? "o" : "i"}
                      </p>
                    </div>
                    <GroupMembershipButton groupId={g.id} isMember />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">{g.description}</p>
                  <Link
                    href={`/community/${g.id}`}
                    className="mt-3 inline-flex text-xs font-semibold text-sea-700 underline"
                  >
                    Apri bacheca →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {discover.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-sm font-bold text-ink">
              Scopri altri gruppi
            </h2>
            <ul className="space-y-3">
              {discover.map((g) => (
                <li
                  key={g.id}
                  className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-bold text-ink">
                        {g.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {g.city}
                        {g.university ? ` · ${g.university}` : " · tutta la città"}
                      </p>
                    </div>
                    <GroupMembershipButton groupId={g.id} isMember={false} />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">{g.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </StudentShell>
  );
}
