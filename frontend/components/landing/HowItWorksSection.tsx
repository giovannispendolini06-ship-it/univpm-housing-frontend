import Reveal from "./Reveal";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  steps: Step[];
  ctaLabel: string;
  ctaHref: string;
  variant?: "default" | "muted";
}

export default function HowItWorksSection({
  id,
  eyebrow,
  title,
  steps,
  ctaLabel,
  ctaHref,
  variant = "default",
}: HowItWorksSectionProps) {
  return (
    <section
      id={id}
      className={variant === "muted" ? "bg-white" : "bg-bg"}
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wide text-sea-600">
            {eyebrow}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {title}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 120}>
              <div className="h-full rounded-xl2 bg-surface p-5 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sea-600 font-display text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={steps.length * 120}>
          <a
            href={ctaHref}
            className="mt-8 inline-flex rounded-full bg-sunset-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sunset-600 hover:shadow-lg"
          >
            {ctaLabel}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
