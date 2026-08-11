/** Progresso scoperta profilo in chat Vesta (7 step). */

export const CHAT_PROGRESS_TOTAL = 7;

export type ChatProgressStepKey =
  | "campus"
  | "budget"
  | "moveIn"
  | "study"
  | "social"
  | "clean"
  | "extras";

export interface ChatProgress {
  done: number;
  total: number;
  /** Prossimo step da completare, o null se completo */
  current: ChatProgressStepKey | null;
}

export const CHAT_PROGRESS_STEPS: {
  key: ChatProgressStepKey;
  /** Almeno uno di questi campi profilo deve essere valorizzato */
  anyOf: string[];
}[] = [
  { key: "campus", anyOf: ["campus_id", "degree_course"] },
  { key: "budget", anyOf: ["budget_max"] },
  { key: "moveIn", anyOf: ["preferred_move_in_date"] },
  { key: "study", anyOf: ["study_habit"] },
  { key: "social", anyOf: ["sociability_level", "guests_frequency"] },
  { key: "clean", anyOf: ["cleanliness_level"] },
  { key: "extras", anyOf: ["is_smoker", "has_pets"] },
];

const PROGRESS_REGEX = /<PROGRESS>([\s\S]*?)<\/PROGRESS>/i;

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function computeChatProgressFromProfile(
  profile: Record<string, unknown> | null | undefined,
): ChatProgress {
  if (!profile) {
    return { done: 0, total: CHAT_PROGRESS_TOTAL, current: CHAT_PROGRESS_STEPS[0].key };
  }

  let done = 0;
  let current: ChatProgressStepKey | null = null;

  for (const step of CHAT_PROGRESS_STEPS) {
    const complete = step.anyOf.some((field) => isFilled(profile[field]));
    if (complete) {
      done += 1;
    } else if (!current) {
      current = step.key;
    }
  }

  return { done, total: CHAT_PROGRESS_TOTAL, current };
}

export function stripProgressTag(text: string): string {
  return text.replace(PROGRESS_REGEX, "").trim();
}

export function parseProgressTag(text: string): ChatProgress | null {
  const match = text.match(PROGRESS_REGEX);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1]) as {
      done?: unknown;
      current?: unknown;
    };
    const done = Math.max(
      0,
      Math.min(CHAT_PROGRESS_TOTAL, Number(raw.done) || 0),
    );
    const currentKey =
      typeof raw.current === "string" &&
      CHAT_PROGRESS_STEPS.some((s) => s.key === raw.current)
        ? (raw.current as ChatProgressStepKey)
        : null;

    return {
      done,
      total: CHAT_PROGRESS_TOTAL,
      current: done >= CHAT_PROGRESS_TOTAL ? null : currentKey,
    };
  } catch {
    return null;
  }
}

/** Preferisce il progresso più avanzato tra tag modello e profilo DB. */
export function mergeChatProgress(
  fromTag: ChatProgress | null,
  fromProfile: ChatProgress,
): ChatProgress {
  if (!fromTag) return fromProfile;
  if (fromTag.done >= fromProfile.done) {
    return {
      done: fromTag.done,
      total: CHAT_PROGRESS_TOTAL,
      current:
        fromTag.done >= CHAT_PROGRESS_TOTAL
          ? null
          : fromTag.current ?? fromProfile.current,
    };
  }
  return fromProfile;
}
