import Link from "next/link";
import HeroMockup from "./HeroMockup";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Anelli decorativi sottili: stesso motivo visivo del logo e del
          punteggio di compatibilità (MatchScoreRing), non una sfumatura
          sfocata generica. Solo tratti, nessun riempimento: composizione
          volutamente asimmetrica, non centrata. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[380px] w-[380px] text-sea-600/[0.07]"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-[220px] w-[220px] text-sunset-500/[0.1]"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="6 5" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-xs font-medium text-sea-700">
              🎓 Pensato per chi studia fuori sede
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
              Trova casa <span className="text-sea-600">chattando</span>, non
              scorrendo annunci a caso.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
              Racconta a Vesta la tua facoltà, il tuo budget e le tue abitudini
              di convivenza. Ti proponiamo solo le stanze davvero compatibili
              con te, vicino al tuo ateneo.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-sea-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-sea-700 hover:shadow-lg"
              >
                Sono uno studente →
              </Link>
              <a
                href="/proprietari"
                className="rounded-xl2 border border-sea-200 bg-white px-6 py-3 text-center text-sm font-semibold text-ink transition hover:border-sea-400"
              >
                Sono un proprietario
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-4 text-xs text-ink-muted">
              Gratis per gli studenti. Nessuna carta di credito richiesta. ·{" "}
              <Link href="/esempi" className="text-sea-700 underline underline-offset-2">
                Vedi un esempio
              </Link>
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="relative">
            <TiltCard>
              <HeroMockup />
            </TiltCard>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl2 bg-white px-4 py-3 shadow-card sm:-left-8 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sea-600" />
              <p className="text-[11px] font-medium text-ink-muted">
                Compatibilità calcolata in tempo reale
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
