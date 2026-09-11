-- ============================================================================
-- MIGRATION: tracking contatti WhatsApp (admin CRM) + template messaggi
--
-- - admin_contact_events: log ogni volta che l'operatore apre WhatsApp
--   (stato = whatsapp_opened / "Contatto avviato" — NON "inviato")
-- - Colonne denormalizzate su users per UX scheda contatto
-- - whatsapp_message_templates: override admin dei template di default
--
-- Idempotente. Esegui nel SQL Editor di Supabase.
-- ============================================================================

-- Log eventi contatto (niente PII nei log applicativi; qui solo id/stato)
create table if not exists public.admin_contact_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- user | landlord_lead | waitlist | property_owner
  entity_kind text not null,
  entity_id text not null,
  -- owner | student
  contact_type text not null,
  contact_method text not null default 'whatsapp',
  -- OWNER | STUDENT | FOLLOW_UP_OWNER | FOLLOW_UP_STUDENT | CUSTOM
  contact_template text not null,
  -- whatsapp_opened = WhatsApp aperto / Contatto avviato
  contact_status text not null default 'whatsapp_opened',
  source text,
  agent_id uuid references auth.users (id) on delete set null
);

create index if not exists idx_admin_contact_events_entity
  on public.admin_contact_events (entity_kind, entity_id, created_at desc);

create index if not exists idx_admin_contact_events_created
  on public.admin_contact_events (created_at desc);

alter table public.admin_contact_events enable row level security;

-- Solo service role / admin via server actions (niente policy anon)
drop policy if exists "admin_contact_events_deny_all" on public.admin_contact_events;
create policy "admin_contact_events_deny_all"
  on public.admin_contact_events
  for all
  using (false)
  with check (false);

-- Denormalizzato su users (scheda contatto veloce)
alter table public.users
  add column if not exists last_contacted_at timestamptz,
  add column if not exists last_contact_method text,
  add column if not exists last_contact_template text,
  add column if not exists last_contact_status text;

-- Template WhatsApp modificabili da admin
create table if not exists public.whatsapp_message_templates (
  template_key text primary key,
  body text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.whatsapp_message_templates enable row level security;

drop policy if exists "whatsapp_templates_deny_all" on public.whatsapp_message_templates;
create policy "whatsapp_templates_deny_all"
  on public.whatsapp_message_templates
  for all
  using (false)
  with check (false);

-- Estensione opzionale su landlord_leads per ultimo template usato
alter table public.landlord_leads
  add column if not exists last_contact_method text,
  add column if not exists last_contact_template text,
  add column if not exists last_contact_status text;
