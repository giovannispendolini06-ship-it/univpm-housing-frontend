// lib/types.ts
// Tipi condivisi tra ChatPanel e RoomList. Rispecchiano le tabelle Supabase
// `rooms`, `properties` e `match_scores` definite nello schema SQL.

export type ChatRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO timestamp
}

export type UnivpmPolo =
  | "monte_dago"
  | "torrette"
  | "centro_economia_giurisprudenza"
  | "altro";

export interface MatchReason {
  label: string; // es. "Budget compatibile"
  detail: string; // es. "420€ rientra nei tuoi 450€ max"
  weight: "alto" | "medio" | "basso";
}

export interface RecommendedRoom {
  id: string;
  propertyId: string;
  title: string; // es. "Singola luminosa, zona Torrette"
  zone: string; // quartiere
  polo: UnivpmPolo;
  distanceMinutes: number; // minuti dal polo coi mezzi
  distanceLabel: string; // es. "12 min • Linea 65"
  priceMonthly: number;
  estimatedUtilities: number;
  imageUrl: string;
  matchScore: number; // 0-100, da match_scores.compatibility_score
  matchReasons: MatchReason[]; // da match_scores.ai_reasoning
  servicesIncluded: string[];
  availableFrom: string; // es. "1 ottobre"
}
