// lib/matching.ts
//
// Calcolo del compatibility score tra uno studente e una stanza.
// Pesi (totale 100): budget 30, distanza dal polo 20, affinità di studio
// con i coinquilini 20, pulizia 15, socievolezza/ospiti 15.

import type { Locale } from "@/lib/i18n/translations";

export type MatchLocale = Locale;

export interface StudentProfileRow {
  user_id: string;
  polo_univpm: "monte_dago" | "torrette" | "centro_economia_giurisprudenza" | "altro";
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
  distance_monte_dago_km: number | null;
  distance_torrette_km: number | null;
  distance_centro_km: number | null;
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

const LABELS = {
  it: {
    budgetCompatible: "Budget compatibile",
    distanceFromCampus: "Distanza dal polo",
    distanceUnavailable: "Distanza dal tuo polo non ancora disponibile per questa zona",
    campusProximity: "Vicinanza al polo",
    kmFromCampus: (km: string) => `${km} km dal tuo polo di riferimento`,
    studyHours: "Orari di studio",
    noRoommates: "Nessun coinquilino attuale: nessun potenziale conflitto di abitudini",
    smokingConflict: "Attenzione: tra i coinquilini attuali c'è chi fuma in casa",
    studyHabitsMatch: "Le tue abitudini di studio combaciano con quelle di chi vive già lì",
    studyHabitsDiffer: "Abitudini di studio diverse rispetto ai coinquilini attuali",
    cleanliness: "Pulizia",
    noRoommatesCleanliness: "Nessun coinquilino attuale con cui confrontare le abitudini",
    cleanlinessMatch: "Livello di ordine in linea con chi vive già in casa",
    cleanlinessDiffer: "Livello di ordine piuttosto diverso da quello dei coinquilini attuali",
    socialLife: "Vita sociale",
    noRoommatesSocial: "Ancora nessun coinquilino: la vita di casa la definirete insieme",
    guestsMatch: "Frequenza di ospiti/feste in linea con la casa",
    guestsDiffer: "Frequenza di ospiti/feste diversa da quella dei coinquilini attuali",
    budgetWithin: (total: number, max: number) =>
      `${total}€ tutto incluso rientra nei tuoi ${max}€ massimi`,
    budgetOver: (total: number, diff: string) =>
      `${total}€ tutto incluso supera di ${diff}€ il tuo budget`,
  },
  en: {
    budgetCompatible: "Budget compatible",
    distanceFromCampus: "Distance from campus",
    distanceUnavailable: "Distance from your campus not yet available for this area",
    campusProximity: "Campus proximity",
    kmFromCampus: (km: string) => `${km} km from your reference campus`,
    studyHours: "Study hours",
    noRoommates: "No current roommates: no known habit conflicts",
    smokingConflict: "Note: one of the current roommates smokes at home",
    studyHabitsMatch: "Your study habits match those of who already lives there",
    studyHabitsDiffer: "Study habits differ from current roommates",
    cleanliness: "Cleanliness",
    noRoommatesCleanliness: "No current roommates to compare habits with",
    cleanlinessMatch: "Cleanliness level in line with who already lives there",
    cleanlinessDiffer: "Cleanliness level quite different from current roommates",
    socialLife: "Social life",
    noRoommatesSocial: "No roommates yet: you'll define house life together",
    guestsMatch: "Guest/party frequency in line with the house",
    guestsDiffer: "Guest/party frequency different from current roommates",
    budgetWithin: (total: number, max: number) =>
      `€${total} all-in fits within your €${max} maximum`,
    budgetOver: (total: number, diff: string) =>
      `€${total} all-in exceeds your budget by €${diff}`,
  },
} as const;

function scoreBudget(
  student: StudentProfileRow,
  room: RoomForMatching,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const l = LABELS[locale];
  const totalCost = room.price_monthly + room.estimated_utilities;
  const diff = student.budget_max - totalCost;

  let ratio: number;
  if (diff >= 0) {
    ratio = 1;
  } else {
    ratio = Math.max(0, 1 + diff / student.budget_max);
  }

  const points = ratio * 30;
  return {
    points,
    reason: {
      label: l.budgetCompatible,
      detail:
        diff >= 0
          ? l.budgetWithin(totalCost, student.budget_max)
          : l.budgetOver(totalCost, Math.abs(diff).toFixed(0)),
      weight: ratio >= 0.8 ? "alto" : ratio >= 0.5 ? "medio" : "basso",
    },
  };
}

function getDistanceKm(
  polo: StudentProfileRow["polo_univpm"],
  property: PropertyForMatching,
): number | null {
  switch (polo) {
    case "monte_dago":
      return property.distance_monte_dago_km;
    case "torrette":
      return property.distance_torrette_km;
    case "centro_economia_giurisprudenza":
      return property.distance_centro_km;
    default:
      return null;
  }
}

function scoreDistance(
  student: StudentProfileRow,
  property: PropertyForMatching,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const l = LABELS[locale];
  const km = getDistanceKm(student.polo_univpm, property);

  if (km === null) {
    return {
      points: 10,
      reason: {
        label: l.distanceFromCampus,
        detail: l.distanceUnavailable,
        weight: "basso",
      },
    };
  }

  const ratio = Math.max(0, Math.min(1, 1 - (km - 2) / 8));
  const points = ratio * 20;

  return {
    points,
    reason: {
      label: l.campusProximity,
      detail: l.kmFromCampus(km.toFixed(1)),
      weight: ratio >= 0.7 ? "alto" : ratio >= 0.4 ? "medio" : "basso",
    },
  };
}

function scoreRoommateAffinity(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const l = LABELS[locale];

  if (roommates.length === 0) {
    return {
      points: 15,
      reason: {
        label: l.studyHours,
        detail: l.noRoommates,
        weight: "medio",
      },
    };
  }

  const sameHabitCount = roommates.filter(
    (r) => r.study_habit === student.study_habit,
  ).length;
  const habitRatio = sameHabitCount / roommates.length;

  const smokingConflict = !student.tolerates_smokers && roommates.some((r) => r.is_smoker);
  const points = habitRatio * 20 - (smokingConflict ? 8 : 0);

  return {
    points: Math.max(0, points),
    reason: {
      label: l.studyHours,
      detail: smokingConflict
        ? l.smokingConflict
        : habitRatio >= 0.5
          ? l.studyHabitsMatch
          : l.studyHabitsDiffer,
      weight: habitRatio >= 0.5 && !smokingConflict ? "alto" : "medio",
    },
  };
}

function scoreCleanliness(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const l = LABELS[locale];

  if (roommates.length === 0) {
    return {
      points: 12,
      reason: {
        label: l.cleanliness,
        detail: l.noRoommatesCleanliness,
        weight: "basso",
      },
    };
  }

  const avgCleanliness =
    roommates.reduce((sum, r) => sum + r.cleanliness_level, 0) / roommates.length;
  const diff = Math.abs(student.cleanliness_level - avgCleanliness);
  const ratio = Math.max(0, 1 - diff / 4);
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: l.cleanliness,
      detail: diff <= 1 ? l.cleanlinessMatch : l.cleanlinessDiffer,
      weight: diff <= 1 ? "alto" : diff <= 2 ? "medio" : "basso",
    },
  };
}

function scoreSociability(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const l = LABELS[locale];

  if (roommates.length === 0) {
    return {
      points: 12,
      reason: {
        label: l.socialLife,
        detail: l.noRoommatesSocial,
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
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: l.socialLife,
      detail: diff <= 1 ? l.guestsMatch : l.guestsDiffer,
      weight: diff <= 1 ? "alto" : "medio",
    },
  };
}

export function calculateMatchScore(
  student: StudentProfileRow,
  room: RoomForMatching,
  property: PropertyForMatching,
  currentRoommates: StudentProfileRow[],
  locale: MatchLocale = "it",
): MatchResult {
  const budget = scoreBudget(student, room, locale);
  const distance = scoreDistance(student, property, locale);
  const roommateAffinity = scoreRoommateAffinity(student, currentRoommates, locale);
  const cleanliness = scoreCleanliness(student, currentRoommates, locale);
  const sociability = scoreSociability(student, currentRoommates, locale);

  const rawScore =
    budget.points +
    distance.points +
    roommateAffinity.points +
    cleanliness.points +
    sociability.points;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  const reasoning = [budget.reason, distance.reason, roommateAffinity.reason, cleanliness.reason, sociability.reason]
    .sort((a, b) => {
      const rank = { alto: 0, medio: 1, basso: 2 };
      return rank[a.weight] - rank[b.weight];
    })
    .slice(0, 3);

  return { score, reasoning };
}
