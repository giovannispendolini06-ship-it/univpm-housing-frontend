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
//
// NOTA SUL BILINGUISMO: i punteggi (i numeri) sono identici in ogni lingua
// — cambia solo il testo di label/detail mostrato allo studente. Il
// parametro "locale" qui sotto sceglie solo quale testo generare, non
// influisce mai sul calcolo del punteggio stesso.

export type MatchLocale = "it" | "en";

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
  locale: MatchLocale,
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

  const points = ratio * 30;
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
  const km = getDistanceKm(student.polo_univpm, property);
  const isIt = locale === "it";

  if (km === null) {
    return {
      points: 10,
      reason: {
        label: isIt ? "Distanza dal polo" : "Distance from campus",
        detail: isIt
          ? "Distanza dal tuo polo non ancora disponibile per questa zona"
          : "Distance from your campus not yet available for this area",
        weight: "basso",
      },
    };
  }

  const ratio = Math.max(0, Math.min(1, 1 - (km - 2) / 8));
  const points = ratio * 20;

  return {
    points,
    reason: {
      label: isIt ? "Vicinanza al polo" : "Distance from campus",
      detail: isIt
        ? `${km.toFixed(1)} km dal tuo polo di riferimento`
        : `${km.toFixed(1)} km from your reference campus`,
      weight: ratio >= 0.7 ? "alto" : ratio >= 0.4 ? "medio" : "basso",
    },
  };
}

function scoreRoommateAffinity(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: 15,
      reason: {
        label: isIt ? "Orari di studio" : "Study hours",
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

  const smokingConflict = !student.tolerates_smokers && roommates.some((r) => r.is_smoker);
  const points = habitRatio * 20 - (smokingConflict ? 8 : 0);

  return {
    points: Math.max(0, points),
    reason: {
      label: isIt ? "Orari di studio" : "Study hours",
      detail: smokingConflict
        ? isIt
          ? "Attenzione: tra i coinquilini attuali c'è chi fuma in casa"
          : "Note: one of the current roommates smokes at home"
        : habitRatio >= 0.5
          ? isIt
            ? "Le tue abitudini di studio combaciano con quelle di chi vive già lì"
            : "Your study habits match those of who already lives there"
          : isIt
            ? "Abitudini di studio diverse rispetto ai coinquilini attuali"
            : "Study habits differ from current roommates",
      weight: habitRatio >= 0.5 && !smokingConflict ? "alto" : "medio",
    },
  };
}

function scoreCleanliness(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: 12,
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
  const points = ratio * 15;

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
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: 12,
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
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: isIt ? "Vita sociale" : "Social life",
      detail:
        diff <= 1
          ? isIt
            ? "Frequenza di ospiti/feste in linea con la casa"
            : "Guest/party frequency in line with the house"
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
