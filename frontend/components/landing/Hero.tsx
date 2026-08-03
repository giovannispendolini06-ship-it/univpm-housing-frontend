import Link from "next/link";
import HeroMockup from "./HeroMockup";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-xs font-medium text-sea-700">
            🎓 Pensato per chi studia fuori sede
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            Trova casa <span className="text-sea-600">chattando</span>, non
            scorrendo annunci a caso.
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
            Racconta a Nomi la tua facoltà, il tuo budget e le tue abitudini
            di convivenza. Ti proponiamo solo le stanze davvero compatibili
            con te, vicino al tuo ateneo.
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
          <HeroMockup />

          {/* Card fluttuante di rinforzo, sempre UI reale non foto */}
          <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl2 bg-white px-4 py-3 shadow-card sm:-left-8 sm:flex">
            <span className="h-2 w-2 rounded-full bg-sea-600" />
            <p className="text-[11px] font-medium text-ink-muted">
              Compatibilità calcolata in tempo reale
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
