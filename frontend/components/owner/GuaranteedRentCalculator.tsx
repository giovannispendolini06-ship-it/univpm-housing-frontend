"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  estimateGuaranteedRent,
  MQ_DEFAULT,
  MQ_MAX,
  MQ_MIN,
  type EstimateCondition,
  type EstimateZone,
} from "@/lib/owner/guaranteed-rent-estimate";
import styles from "./GuaranteedRentCalculator.module.css";

type Rooms = 2 | 3 | 4;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-[1.5px] px-3.5 py-2 text-[12.5px] font-semibold transition ${
        active
          ? "border-sea-600 bg-sea-600 text-white"
          : "border-sea-100 bg-white text-ink-muted hover:border-sea-600"
      }`}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 mt-5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted first:mt-0">
      {children}
    </p>
  );
}

export default function GuaranteedRentCalculator({
  whatsappNumber,
  formHref = "#proponi",
}: {
  whatsappNumber?: string | null;
  formHref?: string;
}) {
  const { t, locale } = useLocale();
  const C = t.ownerCalculator;

  const [zone, setZone] = useState<EstimateZone>("torrette");
  const [rooms, setRooms] = useState<Rooms>(3);
  const [sizeSqm, setSizeSqm] = useState(MQ_DEFAULT);
  const [condition, setCondition] = useState<EstimateCondition>("buono");
  const [pulse, setPulse] = useState(false);

  const estimate = useMemo(
    () => estimateGuaranteedRent({ zone, rooms, sizeSqm, condition }),
    [zone, rooms, sizeSqm, condition],
  );

  useEffect(() => {
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 450);
    return () => window.clearTimeout(id);
  }, [estimate.guaranteed]);

  const zoneLabel =
    zone === "torrette"
      ? C.zoneTorrette
      : zone === "centro"
        ? C.zoneCentro
        : C.zonePalombina;

  const conditionLabel =
    condition === "buono"
      ? C.conditionGood
      : condition === "rinfrescare"
        ? C.conditionRefresh
        : C.conditionRenovated;

  const whatsappMessage = C.whatsappMessage
    .replace("{zone}", zoneLabel)
    .replace("{rooms}", String(rooms))
    .replace("{mq}", String(sizeSqm))
    .replace("{condition}", conditionLabel)
    .replace("{amount}", String(estimate.guaranteed))
    .replace("{low}", String(estimate.low))
    .replace("{high}", String(estimate.high));

  const whatsappLink = whatsappNumber
    ? buildWhatsAppLink(whatsappNumber, whatsappMessage)
    : null;

  const ctaHref = whatsappLink ?? formHref;
  const ctaExternal = Boolean(whatsappLink);

  const amountFmt = estimate.guaranteed.toLocaleString(
    locale === "en" ? "en-GB" : "it-IT",
  );

  return (
    <section aria-labelledby="owner-calc-title" className="scroll-mt-24">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[1.3px] text-sunset-500">
          {C.eyebrow}
        </p>
        <h2
          id="owner-calc-title"
          className="mb-2.5 font-display text-[1.75rem] font-semibold leading-snug text-ink sm:text-[28px]"
        >
          {C.title}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">{C.subtitle}</p>
      </div>

      <div className="grid gap-8 rounded-[22px] border border-sea-100 bg-white p-6 shadow-card sm:p-8 lg:grid-cols-2 lg:gap-9">
        <div>
          <FieldLabel>{C.zoneLabel}</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["torrette", C.zoneTorrette],
                ["centro", C.zoneCentro],
                ["palombina", C.zonePalombina],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                active={zone === value}
                onClick={() => setZone(value)}
              >
                {label}
              </Chip>
            ))}
          </div>

          <FieldLabel>{C.roomsLabel}</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {([2, 3, 4] as const).map((n) => (
              <Chip key={n} active={rooms === n} onClick={() => setRooms(n)}>
                {n}
              </Chip>
            ))}
          </div>

          <FieldLabel>{C.sizeLabel}</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MQ_MIN}
              max={MQ_MAX}
              step={1}
              value={sizeSqm}
              onChange={(e) => setSizeSqm(Number(e.target.value))}
              className="w-full accent-sea-600"
              aria-label={C.sizeLabel}
            />
            <span className="min-w-[3.75rem] text-right text-[15px] font-extrabold tabular-nums text-ink">
              {sizeSqm} {C.mqUnit}
            </span>
          </div>

          <FieldLabel>{C.conditionLabel}</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["buono", C.conditionGood],
                ["rinfrescare", C.conditionRefresh],
                ["ristrutturato", C.conditionRenovated],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                active={condition === value}
                onClick={() => setCondition(value)}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-sea-600 to-sea-900 px-6 py-7 sm:px-7">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-[200px] w-[200px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,74,0.3), transparent 70%)",
            }}
            aria-hidden
          />
          <p className="relative z-[1] mb-2.5 text-[11px] font-bold uppercase tracking-wide text-white/65">
            {C.resultLabel}
          </p>
          <p
            className={`relative z-[1] mb-1 font-display text-[38px] font-extrabold tabular-nums text-white ${styles.amountPop} ${
              pulse ? styles.amountPopPulse : ""
            }`}
            aria-live="polite"
          >
            <span className="text-base font-normal text-white/70">€</span>
            {amountFmt}{" "}
            <span className="text-base font-normal text-white/70">{C.perMonth}</span>
          </p>
          <p className="relative z-[1] mb-5 text-xs text-white/70">
            {C.rangeLabel
              .replace("{low}", String(estimate.low))
              .replace("{high}", String(estimate.high))}
          </p>
          <p className="relative z-[1] rounded-xl bg-white/10 px-3.5 py-3 text-[11px] leading-relaxed text-white/85">
            {C.disclaimer}
          </p>
          <a
            href={ctaHref}
            {...(ctaExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="relative z-[1] mt-4 block rounded-[11px] bg-sunset-500 px-3 py-3.5 text-center text-[13px] font-bold text-white transition hover:bg-sunset-600"
          >
            {C.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
