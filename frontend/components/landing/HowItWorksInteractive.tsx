"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import VestaAvatar from "@/components/VestaAvatar";
import {
  IconCasa,
  IconChat,
  IconDocumento,
  IconProfilo,
  IconVerificato,
} from "@/components/icons/CoabitoIcons";
import { useLocale } from "@/lib/i18n/LocaleContext";
import styles from "./HowItWorksInteractive.module.css";

type Audience = "student" | "owner";
type StepIndex = 0 | 1 | 2 | 3;

const STUDENT_ICONS = [IconChat, IconCasa, IconProfilo, IconVerificato] as const;
const OWNER_ICONS = [IconChat, IconVerificato, IconCasa, IconDocumento] as const;

type Proof = {
  badge: string;
  title: string;
  body: string;
  detail: string;
  accent: "coral" | "teal";
};

/**
 * Homepage “Come funziona”: modulo interattivo Studente/Proprietario
 * con progress, icone step, frecce e riquadri fiducia espandibili.
 */
export default function HowItWorksInteractive() {
  const { t } = useLocale();
  const D = t.howItWorksDemo;
  const [audience, setAudience] = useState<Audience>("student");
  const [step, setStep] = useState<StepIndex>(0);
  const [screenKey, setScreenKey] = useState(0);
  const [openProof, setOpenProof] = useState<number | null>(null);

  const applyHash = useCallback(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash === "#proprietari") {
      setAudience("owner");
      setStep(0);
      setOpenProof(null);
      setScreenKey((k) => k + 1);
    } else if (hash === "#studenti") {
      setAudience("student");
      setStep(0);
      setOpenProof(null);
      setScreenKey((k) => k + 1);
    }
  }, []);

  useEffect(() => {
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [applyHash]);

  function selectAudience(next: Audience) {
    setAudience(next);
    setStep(0);
    setOpenProof(null);
    setScreenKey((k) => k + 1);
    if (typeof window !== "undefined") {
      const hash = next === "owner" ? "#proprietari" : "#studenti";
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
    }
  }

  function selectStep(index: StepIndex) {
    setStep(index);
    setScreenKey((k) => k + 1);
  }

  function goPrev() {
    if (step === 0) return;
    selectStep((step - 1) as StepIndex);
  }

  function goNext() {
    if (step === 3) return;
    selectStep((step + 1) as StepIndex);
  }

  const steps = audience === "student" ? D.student.steps : D.owner.steps;
  const proofs = (audience === "student" ? D.student.proofs : D.owner.proofs) as readonly Proof[];
  const icons = audience === "student" ? STUDENT_ICONS : OWNER_ICONS;
  const isOwner = audience === "owner";
  const accentActive = isOwner ? "bg-sunset-500 text-white" : "bg-sea-600 text-white";
  const accentIdle = "bg-[#EAF4F2] text-sea-600";

  return (
    <section className="relative scroll-mt-24 bg-bg">
      <span id="studenti" className="absolute -top-24" aria-hidden />
      <span id="proprietari" className="absolute -top-24 left-0" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-sunset-500">
            {D.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-snug text-ink sm:text-[2rem]">
            {D.titleLine1}
            <br />
            {D.titleLine2}
          </h2>

          <div
            className="mt-6 inline-flex rounded-[14px] bg-white p-[5px] shadow-[0_6px_18px_rgba(15,62,57,0.08)]"
            role="tablist"
            aria-label={D.toggleAria}
          >
            <button
              type="button"
              role="tab"
              aria-selected={audience === "student"}
              onClick={() => selectAudience("student")}
              className={[
                styles.toggleBtn,
                "rounded-[10px] px-5 py-2.5 text-[13.5px] font-bold sm:px-6",
                audience === "student"
                  ? "bg-sea-600 text-white"
                  : "text-ink-muted",
              ].join(" ")}
            >
              {D.toggleStudent}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === "owner"}
              onClick={() => selectAudience("owner")}
              className={[
                styles.toggleBtn,
                "rounded-[10px] px-5 py-2.5 text-[13.5px] font-bold sm:px-6",
                audience === "owner"
                  ? "bg-sunset-500 text-white"
                  : "text-ink-muted",
              ].join(" ")}
            >
              {D.toggleOwner}
            </button>
          </div>
        </header>

        <div
          className={[
            styles.progress,
            isOwner ? styles.progressOwner : styles.progressStudent,
          ].join(" ")}
          role="progressbar"
          aria-label={D.progressAria}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step + 1}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.progressTrack}>
              <div
                className={[
                  styles.progressFill,
                  i <= step ? styles.progressFillOn : "",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.15fr_1fr] md:grid-rows-[auto_auto]">
          <div
            className={`${styles.tile} flex flex-col p-5 sm:p-6 md:row-span-2`}
          >
            <ol className="mb-4 flex flex-col gap-0.5" aria-label={D.stepsAria}>
              {steps.map((s, i) => {
                const active = step === i;
                const Icon = icons[i] ?? IconChat;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => selectStep(i as StepIndex)}
                      aria-current={active ? "step" : undefined}
                      className={[
                        styles.step,
                        "flex w-full gap-3 rounded-xl px-3 py-2.5 text-left",
                        active
                          ? isOwner
                            ? "bg-[#FFF1EC]"
                            : "bg-sea-50"
                          : "hover:bg-[#F7FAF9]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          styles.stepIcon,
                          "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full",
                          active ? accentActive : accentIdle,
                        ].join(" ")}
                      >
                        <Icon size={16} className="shrink-0" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-bold text-ink">
                          {s.title}
                        </span>
                        <span className="block text-[11px] leading-snug text-ink-muted">
                          {s.subtitle}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative min-h-[255px] flex-1 overflow-hidden rounded-2xl bg-[#0A2624] px-4 py-4">
              <span className="absolute right-3 top-3 rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/70">
                {D.exampleBadge}
              </span>
              <div
                key={`${audience}-${step}-${screenKey}`}
                className={styles.settle}
              >
                {audience === "student" ? (
                  <StudentScreen index={step} copy={D.student.screens} />
                ) : (
                  <OwnerScreen index={step} copy={D.owner.screens} />
                )}
              </div>
            </div>

            <div className={styles.navRow}>
              <button
                type="button"
                className={[
                  styles.navBtn,
                  isOwner ? styles.navBtnOwner : "",
                ].join(" ")}
                onClick={goPrev}
                disabled={step === 0}
                aria-label={D.prev}
              >
                ← {D.prev}
              </button>
              <span className={styles.navStepLabel}>
                {step + 1} / 4
              </span>
              <button
                type="button"
                className={[
                  styles.navBtn,
                  isOwner ? styles.navBtnOwner : "",
                ].join(" ")}
                onClick={goNext}
                disabled={step === 3}
                aria-label={D.next}
              >
                {D.next} →
              </button>
            </div>
          </div>

          {proofs.map((proof, index) => {
            const isOpen = openProof === index;
            const panelId = `how-proof-${audience}-${index}`;
            const buttonId = `how-proof-btn-${audience}-${index}`;
            return (
              <div key={proof.badge} className={styles.tile}>
                <button
                  id={buttonId}
                  type="button"
                  className={styles.proofBtn}
                  onClick={() =>
                    setOpenProof((prev) => (prev === index ? null : index))
                  }
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={isOpen ? D.collapseHint : D.expandHint}
                >
                  <div className={styles.proofHead}>
                    <span
                      className={[
                        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold",
                        proof.accent === "coral"
                          ? "bg-[#FFF1EC] text-sunset-500"
                          : "bg-sea-50 text-sea-600",
                      ].join(" ")}
                    >
                      {proof.badge}
                    </span>
                    <span
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                      aria-hidden
                    >
                      ⌄
                    </span>
                  </div>
                  <p className="text-sm font-bold text-ink">{proof.title}</p>
                  <p className="text-[11.5px] leading-relaxed text-[#6d817d]">
                    {proof.body}
                  </p>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`${styles.proofBody} ${
                      isOpen ? styles.proofBodyOpen : styles.proofBodyClosed
                    }`}
                  >
                    <div className={styles.proofBodyInner}>
                      <p className={styles.proofDetail}>{proof.detail}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={audience === "student" ? "/login" : "/proprietari"}
            className={[
              "inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition",
              audience === "student"
                ? "bg-sea-600 hover:bg-sea-700"
                : "bg-sunset-500 hover:bg-sunset-600",
            ].join(" ")}
          >
            {audience === "student" ? D.ctaStudent : D.ctaOwner}
          </Link>
        </div>
      </div>
    </section>
  );
}

type StudentScreens = {
  chat: { bot1: string; me: string; bot2: string };
  cost: {
    title: string;
    match: string;
    rent: string;
    utilities: string;
    deposit: string;
    total: string;
    note: string;
  };
  roommates: {
    title: string;
    people: readonly { initials: string; tag: string }[];
  };
  escrow: { rows: readonly { label: string; done: boolean }[] };
};

function StudentScreen({
  index,
  copy,
}: {
  index: StepIndex;
  copy: StudentScreens;
}) {
  if (index === 0) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <VestaAvatar size={20} />
          <span className="text-[12.5px] font-bold text-white">Vesta</span>
        </div>
        <p className="mb-2 max-w-[82%] rounded-[11px] bg-white/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.bot1}
        </p>
        <p className="mb-2 ml-auto max-w-[82%] rounded-[11px] bg-sunset-500 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.me}
        </p>
        <p className="max-w-[82%] rounded-[11px] bg-white/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.bot2}
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="mt-1.5 rounded-xl bg-white px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-extrabold text-ink">
            {copy.cost.title}
          </span>
          <span className="rounded-md bg-sea-600 px-2 py-0.5 text-[10.5px] font-extrabold text-white">
            {copy.cost.match}
          </span>
        </div>
        <div className="border-t border-dashed border-[#E1EAE8] pt-1.5 text-[10px] leading-relaxed text-[#6d817d]">
          {copy.cost.rent} · {copy.cost.utilities} · {copy.cost.deposit}
          <br />
          <span className="font-bold text-ink">{copy.cost.total}</span>
          {" — "}
          {copy.cost.note}
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="mt-1.5 rounded-xl bg-white px-3.5 py-3">
        <p className="text-[13.5px] font-extrabold text-ink">
          {copy.roommates.title}
        </p>
        <div className="mt-2 flex gap-2">
          {copy.roommates.people.map((p) => (
            <div
              key={p.initials}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-sea-50 text-[10px] font-bold text-sea-600">
                {p.initials}
              </div>
              <span className="text-center text-[8px] text-ink-muted">
                {p.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl bg-white px-3.5 py-3.5">
      {copy.escrow.rows.map((row) => (
        <div
          key={row.label}
          className="mb-1.5 flex items-center gap-2 text-[11px] text-[#42544f] last:mb-0"
        >
          <span
            className={[
              "h-1.5 w-1.5 shrink-0 rounded-full",
              row.done ? "bg-sea-600" : "bg-[#E1EAE8]",
            ].join(" ")}
          />
          {row.label}
        </div>
      ))}
    </div>
  );
}

type OwnerScreens = {
  chat: { bot1: string; me: string; bot2: string };
  applicants: {
    rows: readonly {
      initials: string;
      name: string;
      badge: string;
      score: string;
    }[];
  };
  payout: { label: string; amount: string; sub: string };
  whatIf: { question: string; answer: string };
};

function OwnerScreen({
  index,
  copy,
}: {
  index: StepIndex;
  copy: OwnerScreens;
}) {
  if (index === 0) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <VestaAvatar size={20} />
          <span className="text-[12.5px] font-bold text-white">Vesta</span>
        </div>
        <p className="mb-2 max-w-[82%] rounded-[11px] bg-white/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.bot1}
        </p>
        <p className="mb-2 ml-auto max-w-[82%] rounded-[11px] bg-sunset-500 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.me}
        </p>
        <p className="max-w-[82%] rounded-[11px] bg-white/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-white">
          {copy.chat.bot2}
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="space-y-1.5 pt-1">
        {copy.applicants.rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center gap-2.5 rounded-[10px] bg-white px-2.5 py-2"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sea-50 text-[10px] font-bold text-sea-600">
              {row.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-bold text-ink">{row.name}</p>
              <p className="text-[8.5px] text-sea-600">{row.badge}</p>
            </div>
            <span className="rounded-md bg-sea-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {row.score}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="mt-1 rounded-xl bg-gradient-to-br from-sea-600 to-[#0A403D] px-4 py-4">
        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-white/60">
          {copy.payout.label}
        </p>
        <p className="mb-1 text-2xl font-extrabold text-white">
          {copy.payout.amount}
        </p>
        <p className="text-[10.5px] text-white/70">{copy.payout.sub}</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 rounded-xl bg-white px-3.5 py-3.5">
      <p className="mb-1 text-[10.5px] font-bold text-sunset-500">
        {copy.whatIf.question}
      </p>
      <p className="text-[10.5px] leading-relaxed text-[#42544f]">
        {copy.whatIf.answer}
      </p>
    </div>
  );
}
