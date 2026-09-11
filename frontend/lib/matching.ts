// lib/matching.ts
//
// Compatibility score between a seeker (student or worker) and a room.
// Weights (total 100) depend on seeker type — see MATCH_WEIGHTS.
//
// Student: budget 30, distance 20, study affinity 20, cleanliness 15, social 15
// Worker:  budget 30, distance 25, quiet/SW focus 20, cleanliness 15, social 10
//
// Distance still uses campus_id + property_campus_distances when available
// (workers without campus get the neutral distance midpoint).

import type { SeekerRole } from "@/lib/auth/roles";

export type MatchLocale = "it" | "en";

/** Compatibility weights by seeker type (must sum to 100). */
export const MATCH_WEIGHTS = {
  student: {
    budget: 30,
    distance: 20,
    focus: 20,
    cleanliness: 15,
    social: 15,
  },
  worker: {
    budget: 30,
    distance: 25,
    focus: 20,
    cleanliness: 15,
    social: 10,
  },
} as const;

export type MatchWeights = (typeof MATCH_WEIGHTS)[SeekerRole];

export interface StudentProfileRow {
  user_id: string;
  campus_id: string | null;
  budget_max: number;
  study_habit: "silenzio_assoluto" | "rumore_di_fondo_ok" | "musica_in_studio" | "flessibile";
  sociability_level: number; // 1-5
  guests_frequency: "mai" | "raramente" | "a_volte" | "spesso";
  cleanliness_level: number; // 1-5
  is_smoker: boolean;
  tolerates_smokers: boolean;
}

export interface RoomForMatching {
  id: string;
  price_monthly: number;
  estimated_utilities: number;
  is_available: boolean;
}

export interface PropertyForMatching {
  id: string;
  zone: string | null;
}

export interface MatchReason {
  label: string;
  detail: string;
  weight: "alto" | "medio" | "basso";
}

export interface MatchResult {
  score: number; // 0-100
  reasoning: MatchReason[];
}

const GUEST_FREQUENCY_RANK: Record<StudentProfileRow["guests_frequency"], number> = {
  mai: 0,
  raramente: 1,
  a_volte: 2,
  spesso: 3,
};


function scoreBudget(
  student: StudentProfileRow,
  room: RoomForMatching,
  locale: MatchLocale,
  maxPoints: number,
): { points: number; reason: MatchReason } {
  const totalCost = room.price_monthly + room.estimated_utilities;
  const diff = student.budget_max - totalCost;
  const isIt = locale === "it";

  let ratio: number;
  if (diff >= 0) {
    ratio = 1;
  } else {
    ratio = Math.max(0, 1 + diff / student.budget_max);
  }

  const points = ratio * maxPoints;
  return {
    points,
    reason: {
      label: isIt ? "Budget compatibile" : "Budget match",
      detail:
        diff >= 0
          ? isIt
            ? `${totalCost}€ tutto incluso rientra nei tuoi ${student.budget_max}€ massimi`
            : `€${totalCost} all-in fits within your €${student.budget_max} max`
          : isIt
            ? `${totalCost}€ tutto incluso supera di ${Math.abs(diff).toFixed(0)}€ il tuo budget`
            : `€${totalCost} all-in is €${Math.abs(diff).toFixed(0)} over your budget`,
      weight: ratio >= 0.8 ? "alto" : ratio >= 0.5 ? "medio" : "basso",
    },
  };
}

function scoreDistance(
  distanceKm: number | null,
  locale: MatchLocale,
  maxPoints: number,
  seekerType: SeekerRole,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const label =
    seekerType === "worker"
      ? isIt
        ? "Vicinanza / spostamenti"
        : "Commute / proximity"
      : isIt
        ? "Vicinanza al polo"
        : "Distance from campus";

  if (distanceKm === null) {
    return {
      points: maxPoints * 0.5,
      reason: {
        label,
        detail: isIt
          ? seekerType === "worker"
            ? "Distanza dal luogo di riferimento non ancora disponibile per questa zona"
            : "Distanza dal tuo polo non ancora disponibile per questa zona"
          : seekerType === "worker"
            ? "Distance from your reference area not yet available for this zone"
            : "Distance from your campus not yet available for this area",
        weight: "basso",
      },
    };
  }

  const ratio = Math.max(0, Math.min(1, 1 - (distanceKm - 2) / 8));
  const points = ratio * maxPoints;

  return {
    points,
    reason: {
      label,
      detail: isIt
        ? `${distanceKm.toFixed(1)} km dal tuo punto di riferimento`
        : `${distanceKm.toFixed(1)} km from your reference point`,
      weight: ratio >= 0.7 ? "alto" : ratio >= 0.4 ? "medio" : "basso",
    },
  };
}

function scoreFocusAffinity(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
  maxPoints: number,
  seekerType: SeekerRole,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const label =
    seekerType === "worker"
      ? isIt
        ? "Tranquillità / smart working"
        : "Quiet / smart working"
      : isIt
        ? "Orari di studio"
        : "Study hours";

  if (roommates.length === 0) {
    return {
      points: maxPoints * 0.75,
      reason: {
        label,
        detail: isIt
          ? "Nessun coinquilino attuale: nessun potenziale conflitto di abitudini"
          : "No current roommates: no known habit conflicts",
        weight: "medio",
      },
    };
  }

  const sameHabitCount = roommates.filter(
    (r) => r.study_habit === student.study_habit,
  ).length;
  const habitRatio = sameHabitCount / roommates.length;

  const smokingConflict =
    !student.tolerates_smokers && roommates.some((r) => r.is_smoker);
  const points = habitRatio * maxPoints - (smokingConflict ? 8 : 0);

  return {
    points: Math.max(0, points),
    reason: {
      label,
      detail: smokingConflict
        ? isIt
          ? "Attenzione: tra i coinquilini attuali c'è chi fuma in casa"
          : "Note: one of the current roommates smokes at home"
        : habitRatio >= 0.5
          ? isIt
            ? seekerType === "worker"
              ? "Le tue esigenze di concentrazione combaciano con chi vive già lì"
              : "Le tue abitudini di studio combaciano con quelle di chi vive già lì"
            : seekerType === "worker"
              ? "Your focus needs match who already lives there"
              : "Your study habits match those of who already lives there"
          : isIt
            ? seekerType === "worker"
              ? "Esigenze di tranquillità diverse rispetto ai coinquilini attuali"
              : "Abitudini di studio diverse rispetto ai coinquilini attuali"
            : seekerType === "worker"
              ? "Quiet needs differ from current roommates"
              : "Study habits differ from current roommates",
      weight: habitRatio >= 0.5 && !smokingConflict ? "alto" : "medio",
    },
  };
}

function scoreCleanliness(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
  maxPoints: number,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: maxPoints * 0.8,
      reason: {
        label: isIt ? "Pulizia" : "Cleanliness",
        detail: isIt
          ? "Nessun coinquilino attuale con cui confrontare le abitudini"
          : "No current roommates to compare habits with",
        weight: "basso",
      },
    };
  }

  const avgCleanliness =
    roommates.reduce((sum, r) => sum + r.cleanliness_level, 0) / roommates.length;
  const diff = Math.abs(student.cleanliness_level - avgCleanliness);
  const ratio = Math.max(0, 1 - diff / 4);
  const points = ratio * maxPoints;

  return {
    points,
    reason: {
      label: isIt ? "Pulizia" : "Cleanliness",
      detail:
        diff <= 1
          ? isIt
            ? "Livello di ordine in linea con chi vive già in casa"
            : "Cleanliness level in line with who already lives there"
          : isIt
            ? "Livello di ordine piuttosto diverso da quello dei coinquilini attuali"
            : "Cleanliness level quite different from current roommates",
      weight: diff <= 1 ? "alto" : diff <= 2 ? "medio" : "basso",
    },
  };
}

function scoreSociability(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
  maxPoints: number,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: maxPoints * 0.8,
      reason: {
        label: isIt ? "Vita sociale" : "Social life",
        detail: isIt
          ? "Ancora nessun coinquilino: la vita di casa la definirete insieme"
          : "No roommates yet: you'll define house life together",
        weight: "medio",
      },
    };
  }

  const avgGuestRank =
    roommates.reduce((sum, r) => sum + GUEST_FREQUENCY_RANK[r.guests_frequency], 0) /
    roommates.length;
  const studentGuestRank = GUEST_FREQUENCY_RANK[student.guests_frequency];
  const diff = Math.abs(studentGuestRank - avgGuestRank);
  const ratio = Math.max(0, 1 - diff / 3);
  const points = ratio * maxPoints;

  return {
    points,
    reason: {
      label: isIt ? "Vita sociale" : "Social life",
      detail:
        diff <= 1
          ? isIt
            ? "Frequenza di ospiti/feste in linea con la casa"
            : "Frequency of guests/parties in line with the household"
          : isIt
            ? "Frequenza di ospiti/feste diversa da quella dei coinquilini attuali"
            : "Guest/party frequency different from current roommates",
      weight: diff <= 1 ? "alto" : "medio",
    },
  };
}

export function calculateMatchScore(
  student: StudentProfileRow,
  room: RoomForMatching,
  property: PropertyForMatching,
  currentRoommates: StudentProfileRow[],
  distanceKm: number | null,
  locale: MatchLocale = "it",
  seekerType: SeekerRole = "student",
  options?: { wholeUnit?: boolean },
): MatchResult {
  const base = MATCH_WEIGHTS[seekerType];
  const wholeUnit = options?.wholeUnit === true;

  // Whole units: roommate lifestyle dimensions do not apply — renormalize
  // budget + distance so they still sum to 100 without changing MATCH_WEIGHTS.
  let budgetWeight = base.budget;
  let distanceWeight = base.distance;
  if (wholeUnit) {
    const sum = base.budget + base.distance;
    budgetWeight = (base.budget / sum) * 100;
    distanceWeight = (base.distance / sum) * 100;
  }

  const budget = scoreBudget(student, room, locale, budgetWeight);
  const distance = scoreDistance(distanceKm, locale, distanceWeight, seekerType);

  if (wholeUnit) {
    const rawScore = budget.points + distance.points;
    const score = Math.round(Math.max(0, Math.min(100, rawScore)));
    const reasoning = [budget.reason, distance.reason]
      .sort((a, b) => {
        const rank = { alto: 0, medio: 1, basso: 2 };
        return rank[a.weight] - rank[b.weight];
      })
      .slice(0, 3);
    return { score, reasoning };
  }

  const focus = scoreFocusAffinity(
    student,
    currentRoommates,
    locale,
    base.focus,
    seekerType,
  );
  const cleanliness = scoreCleanliness(
    student,
    currentRoommates,
    locale,
    base.cleanliness,
  );
  const sociability = scoreSociability(
    student,
    currentRoommates,
    locale,
    base.social,
  );

  const rawScore =
    budget.points +
    distance.points +
    focus.points +
    cleanliness.points +
    sociability.points;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  const reasoning = [
    budget.reason,
    distance.reason,
    focus.reason,
    cleanliness.reason,
    sociability.reason,
  ]
    .sort((a, b) => {
      const rank = { alto: 0, medio: 1, basso: 2 };
      return rank[a.weight] - rank[b.weight];
    })
    .slice(0, 3);

  return { score, reasoning };
}
