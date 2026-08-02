// lib/matching.ts
//
// Calcolo del compatibility score tra uno studente e una stanza.
// Pesi (totale 100): budget 30, distanza dal polo 20, affinità di studio
// con i coinquilini 20, pulizia 15, socievolezza/ospiti 15.
//
// NB: per confrontare con "i coinquilini già presenti" serve sapere chi
// occupa già le altre stanze della stessa property. Lo schema originale
// non aveva questa relazione: aggiungi una tabella di appoggio, es.
//
//   create table public.room_tenancies (
//     id uuid primary key default gen_random_uuid(),
//     room_id uuid not null references public.rooms(id) on delete cascade,
//     student_id uuid not null references public.users(id) on delete cascade,
//     started_at date not null default current_date,
//     ended_at date
//   );
//
// e considera "coinquilino attuale" chi ha ended_at is null.

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

function scoreBudget(
  student: StudentProfileRow,
  room: RoomForMatching,
): { points: number; reason: MatchReason } {
  const totalCost = room.price_monthly + room.estimated_utilities;
  const diff = student.budget_max - totalCost;

  let ratio: number;
  if (diff >= 0) {
    // Sotto budget: punteggio pieno, con un piccolo bonus se lascia margine
    ratio = 1;
  } else {
    // Sopra budget: penalizza proporzionalmente allo sforamento
    ratio = Math.max(0, 1 + diff / student.budget_max);
  }

  const points = ratio * 30;
  return {
    points,
    reason: {
      label: "Budget compatibile",
      detail:
        diff >= 0
          ? `${totalCost}€ tutto incluso rientra nei tuoi ${student.budget_max}€ massimi`
          : `${totalCost}€ tutto incluso supera di ${Math.abs(diff).toFixed(0)}€ il tuo budget`,
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
): { points: number; reason: MatchReason } {
  const km = getDistanceKm(student.polo_univpm, property);

  if (km === null) {
    return {
      points: 10, // dato mancante: punteggio neutro, non azzeriamo
      reason: {
        label: "Distanza dal polo",
        detail: "Distanza dal tuo polo non ancora disponibile per questa zona",
        weight: "basso",
      },
    };
  }

  // Sotto i 2km punteggio pieno, oltre i 10km punteggio quasi nullo
  const ratio = Math.max(0, Math.min(1, 1 - (km - 2) / 8));
  const points = ratio * 20;

  return {
    points,
    reason: {
      label: "Vicinanza al polo",
      detail: `${km.toFixed(1)} km dal tuo polo di riferimento`,
      weight: ratio >= 0.7 ? "alto" : ratio >= 0.4 ? "medio" : "basso",
    },
  };
}

function scoreRoommateAffinity(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
): { points: number; reason: MatchReason } {
  if (roommates.length === 0) {
    return {
      points: 15, // stanza libera/appartamento nuovo: nessun conflitto noto
      reason: {
        label: "Orari di studio",
        detail: "Nessun coinquilino attuale: nessun potenziale conflitto di abitudini",
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
      label: "Orari di studio",
      detail: smokingConflict
        ? "Attenzione: tra i coinquilini attuali c'è chi fuma in casa"
        : habitRatio >= 0.5
          ? "Le tue abitudini di studio combaciano con quelle di chi vive già lì"
          : "Abitudini di studio diverse rispetto ai coinquilini attuali",
      weight: habitRatio >= 0.5 && !smokingConflict ? "alto" : "medio",
    },
  };
}

function scoreCleanliness(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
): { points: number; reason: MatchReason } {
  if (roommates.length === 0) {
    return {
      points: 12,
      reason: {
        label: "Pulizia",
        detail: "Nessun coinquilino attuale con cui confrontare le abitudini",
        weight: "basso",
      },
    };
  }

  const avgCleanliness =
    roommates.reduce((sum, r) => sum + r.cleanliness_level, 0) / roommates.length;
  const diff = Math.abs(student.cleanliness_level - avgCleanliness);
  const ratio = Math.max(0, 1 - diff / 4); // diff massima possibile = 4
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: "Pulizia",
      detail:
        diff <= 1
          ? "Livello di ordine in linea con chi vive già in casa"
          : "Livello di ordine piuttosto diverso da quello dei coinquilini attuali",
      weight: diff <= 1 ? "alto" : diff <= 2 ? "medio" : "basso",
    },
  };
}

function scoreSociability(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
): { points: number; reason: MatchReason } {
  if (roommates.length === 0) {
    return {
      points: 12,
      reason: {
        label: "Vita sociale",
        detail: "Ancora nessun coinquilino: la vita di casa la definirete insieme",
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
      label: "Vita sociale",
      detail:
        diff <= 1
          ? "Frequenza di ospiti/feste in linea con la casa"
          : "Frequenza di ospiti/feste diversa da quella dei coinquilini attuali",
      weight: diff <= 1 ? "alto" : "medio",
    },
  };
}

export function calculateMatchScore(
  student: StudentProfileRow,
  room: RoomForMatching,
  property: PropertyForMatching,
  currentRoommates: StudentProfileRow[],
): MatchResult {
  const budget = scoreBudget(student, room);
  const distance = scoreDistance(student, property);
  const roommateAffinity = scoreRoommateAffinity(student, currentRoommates);
  const cleanliness = scoreCleanliness(student, currentRoommates);
  const sociability = scoreSociability(student, currentRoommates);

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
