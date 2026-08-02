import type { MatchedRoom, Room, UserPreferences } from "./types";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreBudget(room: Room, prefs: UserPreferences): number {
  if (prefs.budgetMax == null) return 55;
  if (room.rentMonthly <= prefs.budgetMax) {
    const headroom = prefs.budgetMax - room.rentMonthly;
    return clamp(70 + headroom / 20);
  }
  const over = room.rentMonthly - prefs.budgetMax;
  return clamp(55 - over / 10);
}

function scoreLocation(room: Room, prefs: UserPreferences): number {
  let score = 50;
  if (prefs.city) {
    score +=
      room.city.toLowerCase() === prefs.city.toLowerCase() ? 30 : -40;
  }
  if (prefs.neighborhood) {
    score +=
      room.neighborhood.toLowerCase() === prefs.neighborhood.toLowerCase()
        ? 20
        : -5;
  }
  return clamp(score);
}

function scoreLifestyle(room: Room, prefs: UserPreferences): number {
  if (!prefs.lifestyle?.length) return 50;
  const roomTags = new Set(room.lifestyleTags.map((t) => t.toLowerCase()));
  const hits = prefs.lifestyle.filter((t) =>
    roomTags.has(t.toLowerCase()),
  ).length;
  return clamp(40 + (hits / prefs.lifestyle.length) * 60);
}

function scoreHabits(room: Room, prefs: UserPreferences): number {
  let score = 60;
  if (prefs.cleanliness != null) {
    score -= Math.abs(room.cleanliness - prefs.cleanliness) * 8;
  }
  if (prefs.noiseTolerance != null) {
    // noiseTolerance alto = tollera più rumore
    const gap = room.noiseLevel - prefs.noiseTolerance;
    score -= Math.max(0, gap) * 10;
  }
  if (prefs.petsOk === false && room.petsAllowed) score -= 8;
  if (prefs.petsOk === true && !room.petsAllowed) score -= 25;
  if (prefs.smokingOk === false && room.smokingAllowed) score -= 20;
  if (prefs.smokingOk === true && !room.smokingAllowed) score -= 5;
  return clamp(score);
}

function buildReasons(room: Room, prefs: UserPreferences, score: number): string[] {
  const reasons: string[] = [];
  if (prefs.budgetMax != null && room.rentMonthly <= prefs.budgetMax) {
    reasons.push(`Entro budget (€${room.rentMonthly}/mese)`);
  }
  if (
    prefs.neighborhood &&
    room.neighborhood.toLowerCase() === prefs.neighborhood.toLowerCase()
  ) {
    reasons.push(`Quartiere ${room.neighborhood}`);
  } else if (
    prefs.city &&
    room.city.toLowerCase() === prefs.city.toLowerCase()
  ) {
    reasons.push(`A ${room.city}`);
  }
  if (prefs.lifestyle?.length) {
    const overlap = prefs.lifestyle.filter((t) =>
      room.lifestyleTags.some(
        (tag) => tag.toLowerCase() === t.toLowerCase(),
      ),
    );
    if (overlap.length) {
      reasons.push(`Stile: ${overlap.slice(0, 2).join(", ")}`);
    }
  }
  if (score >= 80) reasons.push("Ottima compatibilità complessiva");
  if (!reasons.length) reasons.push("Possibile alternativa da valutare");
  return reasons.slice(0, 3);
}

export function computeMatchScore(
  room: Room,
  prefs: UserPreferences,
): number {
  const weighted =
    scoreBudget(room, prefs) * 0.35 +
    scoreLocation(room, prefs) * 0.25 +
    scoreLifestyle(room, prefs) * 0.2 +
    scoreHabits(room, prefs) * 0.2;
  return Math.round(clamp(weighted));
}

export function rankRooms(
  rooms: Room[],
  prefs: UserPreferences,
  limit = 6,
): MatchedRoom[] {
  return rooms
    .map((room) => {
      const matchScore = computeMatchScore(room, prefs);
      return {
        ...room,
        matchScore,
        matchReasons: buildReasons(room, prefs, matchScore),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function mergePreferences(
  current: UserPreferences,
  next: UserPreferences,
): UserPreferences {
  return {
    ...current,
    ...next,
    lifestyle: next.lifestyle ?? current.lifestyle,
  };
}

export function extractPreferencesBlock(text: string): {
  cleanText: string;
  preferences: UserPreferences;
} {
  const match = text.match(/<<<PREFERENCES>>>([\s\S]*?)<<<END>>>/);
  if (!match) {
    return { cleanText: text.trim(), preferences: {} };
  }

  let preferences: UserPreferences = {};
  try {
    preferences = JSON.parse(match[1].trim()) as UserPreferences;
  } catch {
    preferences = {};
  }

  const cleanText = text.replace(match[0], "").trim();
  return { cleanText, preferences };
}
