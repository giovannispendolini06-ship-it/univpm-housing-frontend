// lib/matching-roommates.ts
//
// Compatibilità studente↔studente con gli stessi pesi del matching stanza:
// budget 30, zona/campus 20, studio 20, pulizia 15, vita sociale 15.

import type {
  MatchLocale,
  MatchReason,
  MatchResult,
  StudentProfileRow,
} from "@/lib/matching";
import type { SeekerRole } from "@/lib/auth/roles";
import { MATCH_WEIGHTS } from "@/lib/matching";

const GUEST_FREQUENCY_RANK: Record<StudentProfileRow["guests_frequency"], number> = {
  mai: 0,
  raramente: 1,
  a_volte: 2,
  spesso: 3,
};

function scorePeerBudget(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const maxBudget = Math.max(a.budget_max, b.budget_max, 1);
  const minBudget = Math.min(a.budget_max, b.budget_max);
  const ratio = minBudget / maxBudget;
  const points = ratio * 30;
  const delta = Math.abs(a.budget_max - b.budget_max);

  return {
    points,
    reason: {
      label: isIt ? "Budget compatibile" : "Budget match",
      detail:
        delta <= 50
          ? isIt
            ? `Budget simili (${a.budget_max}€ e ${b.budget_max}€)`
            : `Similar budgets (€${a.budget_max} and €${b.budget_max})`
          : isIt
            ? `Budget a ${delta.toFixed(0)}€ di distanza`
            : `Budgets €${delta.toFixed(0)} apart`,
      weight: ratio >= 0.8 ? "alto" : ratio >= 0.5 ? "medio" : "basso",
    },
  };
}

function scorePeerCampus(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  if (a.campus_id && b.campus_id && a.campus_id === b.campus_id) {
    return {
      points: 20,
      reason: {
        label: isIt ? "Stesso polo" : "Same campus",
        detail: isIt
          ? "Stesso polo universitario di riferimento"
          : "Same university campus preference",
        weight: "alto",
      },
    };
  }
  if (!a.campus_id || !b.campus_id) {
    return {
      points: 10,
      reason: {
        label: isIt ? "Zona desiderata" : "Preferred area",
        detail: isIt
          ? "Polo non ancora impostato per uno dei due profili"
          : "Campus not set on one of the profiles yet",
        weight: "basso",
      },
    };
  }
  return {
    points: 4,
    reason: {
      label: isIt ? "Zona desiderata" : "Preferred area",
      detail: isIt
        ? "Poli diversi: potreste comunque cercare una zona di compromesso"
        : "Different campuses: you may still agree on a compromise area",
      weight: "basso",
    },
  };
}

function scorePeerStudy(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const same = a.study_habit === b.study_habit;
  const smokingConflict =
    (!a.tolerates_smokers && b.is_smoker) || (!b.tolerates_smokers && a.is_smoker);
  const points = (same ? 20 : 8) - (smokingConflict ? 8 : 0);

  return {
    points: Math.max(0, points),
    reason: {
      label: isIt ? "Orari di studio" : "Study habits",
      detail: smokingConflict
        ? isIt
          ? "Possibile conflitto sul fumo in casa"
          : "Possible conflict about smoking at home"
        : same
          ? isIt
            ? "Abitudini di studio allineate"
            : "Aligned study habits"
          : isIt
            ? "Abitudini di studio diverse"
            : "Different study habits",
      weight: same && !smokingConflict ? "alto" : "medio",
    },
  };
}

function scorePeerCleanliness(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const diff = Math.abs(a.cleanliness_level - b.cleanliness_level);
  const ratio = Math.max(0, 1 - diff / 4);
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: isIt ? "Pulizia" : "Cleanliness",
      detail:
        diff <= 1
          ? isIt
            ? "Livello di ordine molto simile"
            : "Very similar cleanliness level"
          : isIt
            ? "Livello di ordine piuttosto diverso"
            : "Quite different cleanliness levels",
      weight: diff <= 1 ? "alto" : diff <= 2 ? "medio" : "basso",
    },
  };
}

function scorePeerSocial(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const socioDiff = Math.abs(a.sociability_level - b.sociability_level);
  const guestDiff = Math.abs(
    GUEST_FREQUENCY_RANK[a.guests_frequency] - GUEST_FREQUENCY_RANK[b.guests_frequency],
  );
  const socioRatio = Math.max(0, 1 - socioDiff / 4);
  const guestRatio = Math.max(0, 1 - guestDiff / 3);
  const ratio = (socioRatio + guestRatio) / 2;
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: isIt ? "Vita sociale" : "Social life",
      detail:
        ratio >= 0.7
          ? isIt
            ? "Socievolezza e ospiti in linea"
            : "Sociability and guests in line"
          : isIt
            ? "Stili di vita sociale abbastanza diversi"
            : "Fairly different social styles",
      weight: ratio >= 0.7 ? "alto" : "medio",
    },
  };
}

/** Same weight model as room matching, applied peer-to-peer. */
export function calculateRoommateMatchScore(
  a: StudentProfileRow,
  b: StudentProfileRow,
  locale: MatchLocale = "it",
  seekerType: SeekerRole = "student",
): MatchResult {
  const weights = MATCH_WEIGHTS[seekerType];
  // Peer scorers still return student-scale points; rescale to seeker weights.
  const budget = scorePeerBudget(a, b, locale);
  const campus = scorePeerCampus(a, b, locale);
  const study = scorePeerStudy(a, b, locale);
  const cleanliness = scorePeerCleanliness(a, b, locale);
  const social = scorePeerSocial(a, b, locale);

  const scaled = [
    (budget.points / 30) * weights.budget,
    (campus.points / 20) * weights.distance,
    (study.points / 20) * weights.focus,
    (cleanliness.points / 15) * weights.cleanliness,
    (social.points / 15) * weights.social,
  ];

  // Relabel focus/distance for workers
  if (seekerType === "worker") {
    const isIt = locale === "it";
    campus.reason.label = isIt ? "Zona / spostamenti" : "Area / commute";
    study.reason.label = isIt ? "Tranquillità / smart working" : "Quiet / smart working";
  }

  const raw = scaled.reduce((s, n) => s + n, 0);
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  const reasoning = [
    budget.reason,
    campus.reason,
    study.reason,
    cleanliness.reason,
    social.reason,
  ]
    .sort((x, y) => {
      const rank = { alto: 0, medio: 1, basso: 2 };
      return rank[x.weight] - rank[y.weight];
    })
    .slice(0, 3);

  return { score, reasoning };
}

export function toStudentProfileRow(raw: Record<string, unknown>): StudentProfileRow | null {
  const userId = typeof raw.user_id === "string" ? raw.user_id : null;
  const budget = Number(raw.budget_max);
  if (!userId || !Number.isFinite(budget) || budget <= 0) return null;

  const studyHabit = raw.study_habit;
  const guests = raw.guests_frequency;
  const studyOk =
    studyHabit === "silenzio_assoluto" ||
    studyHabit === "rumore_di_fondo_ok" ||
    studyHabit === "musica_in_studio" ||
    studyHabit === "flessibile";
  const guestsOk =
    guests === "mai" ||
    guests === "raramente" ||
    guests === "a_volte" ||
    guests === "spesso";

  return {
    user_id: userId,
    campus_id: typeof raw.campus_id === "string" ? raw.campus_id : null,
    budget_max: budget,
    study_habit: studyOk ? studyHabit : "flessibile",
    sociability_level: Math.min(5, Math.max(1, Number(raw.sociability_level) || 3)),
    guests_frequency: guestsOk ? guests : "a_volte",
    cleanliness_level: Math.min(5, Math.max(1, Number(raw.cleanliness_level) || 3)),
    is_smoker: Boolean(raw.is_smoker),
    tolerates_smokers:
      raw.tolerates_smokers === undefined || raw.tolerates_smokers === null
        ? true
        : Boolean(raw.tolerates_smokers),
  };
}
