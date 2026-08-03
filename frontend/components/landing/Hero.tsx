import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-xs font-medium text-sea-700">
            🎓 Fatto apposta per UNIVPM Ancona
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            Trova casa ad Ancona{" "}
            <span className="text-sea-600">chattando</span>, non scorrendo
            annunci a caso.
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
            Racconta a Domi la tua facoltà, il tuo budget e le tue abitudini
            di convivenza. Ti proponiamo solo le stanze davvero compatibili
            con te, vicino al tuo polo.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-sea-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-sea-700"
            >
              Sono uno studente →
            </Link>
            <a
              href="#proprietari"
              className="rounded-full border border-sea-200 bg-white px-6 py-3 text-center text-sm font-semibold text-ink transition hover:border-sea-400"
            >
              Sono un proprietario
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Gratis per gli studenti. Nessuna carta di credito richiesta.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl2 shadow-card">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop"
              alt="Appartamento luminoso per studenti"
              className="h-72 w-full object-cover sm:h-96"
            />
          </div>
          {/* Card fluttuante stile match score, coerente con la dashboard */}
          <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-xl2 bg-white px-4 py-3 shadow-card sm:-left-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sea-50 font-display text-sm font-bold text-sea-700">
              92%
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Compatibile con te</p>
              <p className="text-[11px] text-ink-muted">9 min da Monte Dago</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
