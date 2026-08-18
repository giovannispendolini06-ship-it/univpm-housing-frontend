// lib/matching.ts
//
// Compatibilità Coabito — scorer deterministico e spiegabile.
// Pesi MVP (totale 100), allineati al product brief:
//   budget 20, distanza/polo 20, date ingresso 15, pulizia 10,
//   orari studio 10, socialità 10, vincoli hard (fumo/animali) 10, ospiti 5.
// Un motore ML può sostituire calculateMatchScore senza cambiare il dominio Match.
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
// NOTA SUI POLI / campus_id: il punteggio distanza usa campus_id (FK a
// campuses) e property_campus_distances — NON polo_univpm né le colonne
// legacy distance_* su properties. polo_univpm resta nel profilo per Vesta
// e i form; campus_id viene risolto in /api/chat dal codice polo che Vesta
// estrae nel blocco STUDENT_DATA_JSON.
//
// NOTA SUL BILINGUISMO: i punteggi (i numeri) sono identici in ogni lingua
// — cambia solo il testo di label/detail mostrato allo studente. Il
// parametro "locale" qui sotto sceglie solo quale testo generare, non
// influisce mai sul calcolo del punteggio stesso.

export type MatchLocale = "it" | "en";

export interface StudentProfileRow {
  user_id: string;
  campus_id: string | null;
  budget_max: number;
  preferred_move_in_date?: string | null;
  study_habit: "silenzio_assoluto" | "rumore_di_fondo_ok" | "musica_in_studio" | "flessibile";
  sociability_level: number; // 1-5
  guests_frequency: "mai" | "raramente" | "a_volte" | "spesso";
  cleanliness_level: number; // 1-5
  is_smoker: boolean;
  tolerates_smokers: boolean;
  has_pets?: boolean | null;
}

export interface RoomForMatching {
  id: string;
  price_monthly: number;
  estimated_utilities: number;
  is_available: boolean;
  available_from?: string | null;
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

  const points = ratio * 20;
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
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (distanceKm === null) {
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

  const ratio = Math.max(0, Math.min(1, 1 - (distanceKm - 2) / 8));
  const points = ratio * 20;

  return {
    points,
    reason: {
      label: isIt ? "Vicinanza al polo" : "Distance from campus",
      detail: isIt
        ? `${distanceKm.toFixed(1)} km dal tuo polo di riferimento`
        : `${distanceKm.toFixed(1)} km from your reference campus`,
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
      points: 7,
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
  const points = habitRatio * 10;

  return {
    points: Math.max(0, points),
    reason: {
      label: isIt ? "Orari di studio" : "Study hours",
      detail: smokingConflict
        ? isIt
          ? "Abitudini di studio confrontate con i coinquilini (vedi anche vincoli fumo)"
          : "Study habits compared with roommates (see also smoking constraints)"
        : habitRatio >= 0.5
          ? isIt
            ? "Le tue abitudini di studio combaciano con quelle di chi vive già lì"
            : "Your study habits match those of who already lives there"
          : isIt
            ? "Abitudini di studio diverse rispetto ai coinquilini attuali"
            : "Study habits differ from current roommates",
      weight: habitRatio >= 0.5 ? "alto" : "medio",
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
      points: 7,
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
  const points = ratio * 10;

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
      points: 7,
      reason: {
        label: isIt ? "Vita sociale" : "Social life",
        detail: isIt
          ? "Ancora nessun coinquilino: la vita di casa la definirete insieme"
          : "No roommates yet: you'll define house life together",
        weight: "medio",
      },
    };
  }

  const avgSocial =
    roommates.reduce((sum, r) => sum + r.sociability_level, 0) / roommates.length;
  const diff = Math.abs(student.sociability_level - avgSocial);
  const ratio = Math.max(0, 1 - diff / 4);
  const points = ratio * 10;

  return {
    points,
    reason: {
      label: isIt ? "Vita sociale" : "Social life",
      detail:
        diff <= 1
          ? isIt
            ? "Livello di socialità in linea con la casa"
            : "Social level in line with the household"
          : isIt
            ? "Livello di socialità diverso dai coinquilini attuali"
            : "Social level differs from current roommates",
      weight: diff <= 1 ? "alto" : "medio",
    },
  };
}

function scoreGuests(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";

  if (roommates.length === 0) {
    return {
      points: 3,
      reason: {
        label: isIt ? "Ospiti" : "Guests",
        detail: isIt
          ? "Nessun confronto ospiti finché la casa è vuota"
          : "No guest comparison until the house has occupants",
        weight: "basso",
      },
    };
  }

  const avgGuestRank =
    roommates.reduce((sum, r) => sum + GUEST_FREQUENCY_RANK[r.guests_frequency], 0) /
    roommates.length;
  const studentGuestRank = GUEST_FREQUENCY_RANK[student.guests_frequency];
  const diff = Math.abs(studentGuestRank - avgGuestRank);
  const ratio = Math.max(0, 1 - diff / 3);
  const points = ratio * 5;

  return {
    points,
    reason: {
      label: isIt ? "Ospiti" : "Guests",
      detail:
        diff <= 1
          ? isIt
            ? "Frequenza di ospiti in linea con la casa"
            : "Guest frequency in line with the household"
          : isIt
            ? "Frequenza di ospiti diversa da quella dei coinquilini"
            : "Guest frequency different from current roommates",
      weight: diff <= 1 ? "alto" : "medio",
    },
  };
}

function scoreMoveIn(
  student: StudentProfileRow,
  room: RoomForMatching,
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  const preferred = student.preferred_move_in_date;
  const available = room.available_from;

  if (!preferred || !available) {
    return {
      points: 8,
      reason: {
        label: isIt ? "Date di ingresso" : "Move-in dates",
        detail: isIt
          ? "Date non ancora complete: da confermare in candidatura"
          : "Dates incomplete: confirm during application",
        weight: "basso",
      },
    };
  }

  const pref = new Date(preferred).getTime();
  const avail = new Date(available).getTime();
  if (Number.isNaN(pref) || Number.isNaN(avail)) {
    return {
      points: 8,
      reason: {
        label: isIt ? "Date di ingresso" : "Move-in dates",
        detail: isIt ? "Date non interpreteabili" : "Dates not parseable",
        weight: "basso",
      },
    };
  }

  // Full points if room is free on/before preferred move-in; decays over ~60 days late
  const daysLate = Math.max(0, (avail - pref) / (1000 * 60 * 60 * 24));
  const ratio = Math.max(0, 1 - daysLate / 60);
  const points = ratio * 15;

  return {
    points,
    reason: {
      label: isIt ? "Date di ingresso" : "Move-in dates",
      detail:
        daysLate <= 0
          ? isIt
            ? "La stanza risulta disponibile entro la tua data"
            : "Room appears available by your date"
          : isIt
            ? `Disponibilità circa ${Math.round(daysLate)} giorni dopo la tua data`
            : `Availability about ${Math.round(daysLate)} days after your date`,
      weight: ratio >= 0.8 ? "alto" : ratio >= 0.4 ? "medio" : "basso",
    },
  };
}

function scoreHardConstraints(
  student: StudentProfileRow,
  roommates: StudentProfileRow[],
  locale: MatchLocale,
): { points: number; reason: MatchReason } {
  const isIt = locale === "it";
  let points = 10;
  const issues: string[] = [];

  const smokingConflict =
    student.tolerates_smokers === false && roommates.some((r) => r.is_smoker);
  if (smokingConflict) {
    points -= 7;
    issues.push(isIt ? "fumo in casa" : "smoking at home");
  }

  // Soft pet flag: if student has pets and we only know roommate pets conflict when roommate has_pets === false isn't modeled; skip if unknown
  const roommateRejectsPets = roommates.some((r) => r.has_pets === false);
  if (student.has_pets && roommateRejectsPets) {
    points -= 3;
    issues.push(isIt ? "animali" : "pets");
  }

  points = Math.max(0, points);

  return {
    points,
    reason: {
      label: isIt ? "Vincoli (fumo/animali)" : "Hard constraints",
      detail:
        issues.length === 0
          ? isIt
            ? "Nessun conflitto duro evidente su fumo/animali"
            : "No clear hard conflict on smoking/pets"
          : isIt
            ? `Possibile tensione su: ${issues.join(", ")}`
            : `Possible tension on: ${issues.join(", ")}`,
      weight: points >= 8 ? "alto" : points >= 4 ? "medio" : "basso",
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
): MatchResult {
  void property; // reserved for future zone/rules scoring
  const budget = scoreBudget(student, room, locale);
  const distance = scoreDistance(distanceKm, locale);
  const moveIn = scoreMoveIn(student, room, locale);
  const cleanliness = scoreCleanliness(student, currentRoommates, locale);
  const schedule = scoreRoommateAffinity(student, currentRoommates, locale);
  const social = scoreSociability(student, currentRoommates, locale);
  const hard = scoreHardConstraints(student, currentRoommates, locale);
  const guests = scoreGuests(student, currentRoommates, locale);

  const rawScore =
    budget.points +
    distance.points +
    moveIn.points +
    cleanliness.points +
    schedule.points +
    social.points +
    hard.points +
    guests.points;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  const reasoning = [
    budget.reason,
    distance.reason,
    moveIn.reason,
    cleanliness.reason,
    schedule.reason,
    social.reason,
    hard.reason,
    guests.reason,
  ]
    .sort((a, b) => {
      const rank = { alto: 0, medio: 1, basso: 2 };
      return rank[a.weight] - rank[b.weight];
    })
    .slice(0, 3);

  return { score, reasoning };
}
