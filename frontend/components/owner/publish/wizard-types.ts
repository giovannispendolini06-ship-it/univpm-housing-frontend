import type {
  ContractDurationType,
  PropertyType,
} from "@/lib/property-listing";
import type { NearbyPoi } from "@/lib/mapbox-geocoding";

export type TargetAudience = "studenti" | "lavoratori" | "entrambi";

export type ListingWizardDraft = {
  /** Existing bozza property id when autosaved */
  propertyId: string | null;
  roomId: string | null;
  step: number;
  // Step 1 — address + type
  address: string;
  zone: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: PropertyType;
  contractDurationType: ContractDurationType;
  targetAudience: TargetAudience;
  nearbyPois: NearbyPoi[];
  // Step 2 — details + media
  roomLabel: string;
  sizeSqm: number | null;
  floorNumber: number | null;
  totalRooms: number;
  isFurnished: boolean;
  hasPrivateBathroom: boolean;
  hasBalcony: boolean;
  servicesIncluded: string[];
  photoUrl: string | null;
  virtualTourUrl: string;
  highlights: string;
  // Step 3 — price + availability
  priceMonthly: number | null;
  estimatedUtilities: number;
  depositAmount: number | null;
  availableFrom: string;
  availableUntil: string;
  // Step 4 — description
  description: string;
};

export const WIZARD_STEPS = [
  { id: 1, label: "Indirizzo" },
  { id: 2, label: "Dettagli" },
  { id: 3, label: "Prezzo" },
  { id: 4, label: "Descrizione" },
  { id: 5, label: "Anteprima" },
] as const;

export const EMPTY_WIZARD_DRAFT: ListingWizardDraft = {
  propertyId: null,
  roomId: null,
  step: 1,
  address: "",
  zone: "",
  city: "",
  latitude: null,
  longitude: null,
  propertyType: "stanza_singola",
  contractDurationType: "anno_accademico",
  targetAudience: "entrambi",
  nearbyPois: [],
  roomLabel: "",
  sizeSqm: null,
  floorNumber: null,
  totalRooms: 2,
  isFurnished: true,
  hasPrivateBathroom: false,
  hasBalcony: false,
  servicesIncluded: [],
  photoUrl: null,
  virtualTourUrl: "",
  highlights: "",
  priceMonthly: null,
  estimatedUtilities: 40,
  depositAmount: null,
  availableFrom: "",
  availableUntil: "",
  description: "",
};

export const LOCAL_DRAFT_KEY = "coabito:listing-publish-draft:v1";

/** Below this compatible-seeker count we show encouraging copy instead of a harsh zero. */
export const LOW_DEMAND_THRESHOLD = 5;
