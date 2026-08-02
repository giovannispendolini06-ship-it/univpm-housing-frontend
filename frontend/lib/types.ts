export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface UserPreferences {
  budgetMax?: number;
  city?: string;
  neighborhood?: string;
  moveInDate?: string;
  lifestyle?: string[];
  cleanliness?: number;
  noiseTolerance?: number;
  petsOk?: boolean;
  smokingOk?: boolean;
  notes?: string;
}

export interface Room {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  rentMonthly: number;
  availableFrom: string;
  beds: number;
  amenities: string[];
  imageUrl?: string;
  lifestyleTags: string[];
  cleanliness: number;
  noiseLevel: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  description: string;
}

export interface MatchedRoom extends Room {
  matchScore: number;
  matchReasons: string[];
}

export interface ChatRequestBody {
  messages: Array<{ role: MessageRole; content: string }>;
  preferences?: UserPreferences;
}

export interface ChatResponseBody {
  reply: string;
  preferences: UserPreferences;
  rooms: MatchedRoom[];
}
