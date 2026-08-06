// Costanti condivise della pipeline proprietari (CRM outbound).

export const LANDLORD_ZONE_OPTIONS = [
  { value: "centro", label: "Centro / Villarey" },
  { value: "tavernelle", label: "Tavernelle / Monte Dago" },
  { value: "torrette", label: "Torrette / Quartiere Adriatico" },
  { value: "altro", label: "Altro" },
] as const;

export const LANDLORD_SOURCE_OPTIONS = [
  { value: "idealista", label: "Idealista" },
  { value: "subito", label: "Subito" },
  { value: "passaparola", label: "Passaparola" },
  { value: "amministratore", label: "Amministratore condominio" },
  { value: "volantinaggio", label: "Volantinaggio" },
  { value: "altro", label: "Altro" },
] as const;

export const LANDLORD_STATUS_OPTIONS = [
  { value: "da_contattare", label: "Da contattare" },
  { value: "contattato_attesa", label: "Contattato — in attesa risposta" },
  { value: "in_trattativa", label: "In trattativa" },
  { value: "chiuso_positivo", label: "Chiuso positivo" },
  { value: "rifiutato", label: "Rifiutato" },
  { value: "non_risponde", label: "Non risponde" },
] as const;

export type LandlordLeadStatus = (typeof LANDLORD_STATUS_OPTIONS)[number]["value"];

export const LANDLORD_STATUS_STYLES: Record<LandlordLeadStatus, string> = {
  da_contattare: "bg-sunset-500/15 text-sunset-600",
  contattato_attesa: "bg-sand-400/20 text-ink",
  in_trattativa: "bg-sea-50 text-sea-700",
  chiuso_positivo: "bg-sea-600 text-white",
  rifiutato: "bg-ink-muted/10 text-ink-muted",
  non_risponde: "bg-ink-muted/10 text-ink-muted",
};

export function labelForZone(value: string | null | undefined): string {
  return LANDLORD_ZONE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "—";
}

export function labelForSource(value: string | null | undefined): string {
  return LANDLORD_SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "—";
}

export function labelForStatus(value: string | null | undefined): string {
  return LANDLORD_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "—";
}

export interface LandlordLead {
  id: string;
  created_at: string;
  updated_at: string;
  nome: string;
  telefono: string;
  email: string | null;
  indirizzo_immobile: string | null;
  zona: string | null;
  fonte: string | null;
  link_annuncio: string | null;
  prezzo_richiesto: number | null;
  arredato: boolean | null;
  stato: LandlordLeadStatus;
  data_ultimo_contatto: string | null;
  data_prossimo_followup: string | null;
  note: string | null;
}

/** Giorni fino al follow-up: negativo = scaduto, 0 = oggi, 1 = domani. */
export function followupUrgency(dateStr: string | null): "overdue" | "soon" | "later" | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 1) return "soon";
  return "later";
}
