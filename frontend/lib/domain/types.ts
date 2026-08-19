/**
 * Domain model for Coabito marketplace MVP.
 * Maps preferred product concepts onto the EXISTING Supabase schema —
 * do not invent parallel tables when a clear mapping exists.
 *
 * Product model: marketplace from day one. Seed supply may use
 * Coabito guaranteed-rent agreements (`guaranteed_rent` on properties);
 * independent owners also publish. `monthly_rent_to_owner` remains the
 * ops field for seed-supply economics when applicable.
 */

export type UserRole = "student" | "owner" | "admin";

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

/** Auth + public.users */
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  profileCompleted: boolean;
  preferredLocale: "it" | "en" | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
}

/** Onboarding KYC-lite fields on users (not a separate table). */
export interface Profile {
  userId: string;
  fiscalCode: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

/** student_profiles — lifestyle + academic prefs for Compatibilità Coabito */
export interface LifestyleProfile {
  userId: string;
  campusId: string | null;
  degreeCourse: string | null;
  studyYear: number | null;
  budgetMax: number | null;
  preferredMoveInDate: string | null;
  studyHabit: string | null;
  sociabilityLevel: number | null;
  guestsFrequency: string | null;
  isSmoker: boolean | null;
  hasPets: boolean | null;
  cleanlinessLevel: number | null;
  additionalNotes: string | null;
}

/** properties — supply side (never expose exact address publicly). */
export interface Property {
  id: string;
  ownerId: string;
  cityId: string | null;
  zone: string | null;
  status: string;
  contractType: string | null;
  depositAmount: number | null;
  isFurnished: boolean | null;
  /** Coabito seed listing under guaranteed-rent agreement with the owner */
  guaranteedRent: boolean;
  /** Internal only — not for public listing cards */
  addressInternal?: string;
}

/** rooms — the bookable unit; public "Listing" is Room + Property + images */
export interface Room {
  id: string;
  propertyId: string;
  label: string;
  priceMonthly: number;
  estimatedUtilities: number;
  sizeSqm: number | null;
  hasPrivateBathroom: boolean | null;
  hasBalcony: boolean | null;
  maxOccupants: number | null;
  servicesIncluded: string[];
  isAvailable: boolean;
  availableFrom: string | null;
}

/**
 * Public marketplace listing view-model (composite of room + property + media).
 * Not a separate DB table today.
 */
export interface Listing {
  id: string; // room id
  propertyId: string;
  title: string;
  cityLabel: string;
  neighbourhood: string | null;
  monthlyRent: number;
  utilitiesEstimate: number;
  deposit: number | null;
  contractType: string | null;
  availableFrom: string | null;
  roomTypeLabel: string;
  furnished: boolean | null;
  privateBathroom: boolean | null;
  amenities: string[];
  photoUrls: string[];
  landlordVerified: boolean;
  /** True = seed supply with Coabito guaranteed rent (trust badge) */
  guaranteedRent: boolean;
  propertyStatus: string;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "withdrawn";

/** room_applications — student interest in a room (marketplace). */
export interface Application {
  id: string;
  roomId: string;
  studentId: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

/** match_scores — Compatibilità Coabito (deterministic scorer today). */
export interface Match {
  studentId: string;
  roomId: string;
  score: number;
  reasons: { label: string; detail: string; weight: "alto" | "medio" | "basso" }[];
  algorithmVersion: string;
}

/** Vesta assist uses chat_messages; peer uses conversations + peer_messages. */
export interface Conversation {
  id: string;
  participantIds: string[];
  kind: "vesta_assist" | "peer";
  listingId?: string | null;
  applicationId?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | "vesta";
  body: string;
  createdAt: string;
}

export interface Verification {
  userId: string;
  status: VerificationStatus;
  method: string | null;
  note: string | null;
  verifiedAt: string | null;
}

export interface SavedListing {
  userId: string;
  roomId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "listing" | "user" | "message";
  targetId: string;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
}

/* -------------------------------------------------------------------------- */
/* TODO — not in schema yet                                                    */
/* -------------------------------------------------------------------------- */
// Review, Subscription, Transaction (marketplace take-rate), peer Conversation,
// SavedListing table, Report table, University as first-class SEO entity.
