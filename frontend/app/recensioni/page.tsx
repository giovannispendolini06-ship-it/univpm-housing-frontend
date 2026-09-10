import Link from "next/link";
import type { Metadata } from "next";
import StudentShell from "@/components/student/StudentShell";
import { getPendingReviewsForCurrentUser } from "@/app/reviews/actions";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recensioni da lasciare | Coabito",
  robots: { index: false, follow: false },
};

export default async function RecensioniIndexPage() {
  const session = await requireSession();
  const pending = await getPendingReviewsForCurrentUser();

  const body = (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sea-700">
          Fiducia marketplace
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">
          Recensioni da lasciare
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Si sbloccano solo a fine soggiorno. Una sola recensione per soggiorno.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-xl2 border border-sea-100 bg-white px-4 py-8 text-center shadow-card">
          <p className="font-display text-lg font-bold text-ink">
            Nessuna recensione in sospeso
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Quando un affitto viene chiuso da Coabito, ti arriverà anche un&apos;email
            con il link per recensire.
          </p>
          <Link
            href={session.role === "owner" ? "/owner" : "/dashboard"}
            className="mt-5 inline-flex rounded-full bg-sea-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Torna alla home
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((p) => (
            <li
              key={`${p.tenancyId}-${p.targetType}`}
              className="rounded-xl2 border border-sea-100 bg-white px-4 py-3 shadow-card"
            >
              <p className="font-display text-sm font-bold text-ink">{p.roomLabel}</p>
              <p className="text-xs text-ink-muted">
                {[p.propertyZone, p.city].filter(Boolean).join(" · ")}
                {" · terminato "}
                {new Date(p.endedAt).toLocaleDateString("it-IT")}
              </p>
              <p className="mt-1 text-xs text-ink">
                Recensisci{" "}
                {p.targetType === "landlord"
                  ? p.targetName
                    ? `il proprietario (${p.targetName})`
                    : "il proprietario / l'annuncio"
                  : p.targetName
                    ? `l'inquilino (${p.targetName})`
                    : "l'inquilino"}
              </p>
              <Link
                href={`/recensioni/${p.tenancyId}`}
                className="mt-3 inline-flex rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sea-700"
              >
                Lascia recensione
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (session.role === "student") {
    return <StudentShell>{body}</StudentShell>;
  }

  return <main className="min-h-dvh bg-bg">{body}</main>;
}
