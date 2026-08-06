-- ============================================================================
-- MIGRATION: landlord_leads
-- CRM leggero per proprietari contattati in uscita (cold-call, WhatsApp,
-- passaparola, annunci sui portali). Separato da owner_inquiries (inbound
-- dal form /proprietari) e da leads_external (annunci da lavorareare).
-- ============================================================================

create table if not exists public.landlord_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  nome text not null,
  telefono text not null,
  email text,

  indirizzo_immobile text,
  zona text, -- centro | tavernelle | torrette | altro
  fonte text, -- idealista | subito | passaparola | amministratore | volantinaggio | altro
  link_annuncio text,
  prezzo_richiesto integer,
  arredato boolean,

  stato text not null default 'da_contattare',
  -- da_contattare | contattato_attesa | in_trattativa | chiuso_positivo | rifiutato | non_risponde

  data_ultimo_contatto date,
  data_prossimo_followup date,
  note text,

  constraint landlord_leads_stato_check check (
    stato in (
      'da_contattare',
      'contattato_attesa',
      'in_trattativa',
      'chiuso_positivo',
      'rifiutato',
      'non_risponde'
    )
  )
);

create index if not exists idx_landlord_leads_stato
  on public.landlord_leads (stato);
create index if not exists idx_landlord_leads_followup
  on public.landlord_leads (data_prossimo_followup);
create index if not exists idx_landlord_leads_zona
  on public.landlord_leads (zona);
create index if not exists idx_landlord_leads_updated_at
  on public.landlord_leads (updated_at desc);

-- Aggiorna updated_at a ogni modifica
create or replace function public.set_landlord_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_landlord_leads_updated_at on public.landlord_leads;
create trigger trg_landlord_leads_updated_at
  before update on public.landlord_leads
  for each row
  execute function public.set_landlord_leads_updated_at();

alter table public.landlord_leads enable row level security;

-- Nessuna policy per anon/authenticated: accesso solo via service role
-- dal pannello admin (createServiceSupabaseClient).
