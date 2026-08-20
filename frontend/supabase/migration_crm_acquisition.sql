-- ============================================================================
-- MIGRATION: CRM commerciale Coabito (contatti, agenzie, property leads,
-- timeline, sequenze, partner tokens, email templates CRM)
-- Idempotente. Esegui nel SQL Editor di Supabase.
-- ============================================================================

-- Contatto unificato OWNER | AGENCY | STUDENT | OTHER
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  whatsapp_phone text,
  -- OWNER | AGENCY | STUDENT | OTHER
  contact_type text not null default 'OWNER'
    check (contact_type in ('OWNER', 'AGENCY', 'STUDENT', 'OTHER')),
  -- MANUAL | WEBSITE | MARKETPLACE | REFERRAL | PROPERTY_RESEARCH |
  -- AGENCY_RESEARCH | IMPORT | PIPELINE | INQUIRY | OTHER
  source text default 'MANUAL',
  city text default 'Ancona',
  notes text,
  -- NEW | TO_CONTACT | CONTACTED | REPLIED | INTERESTED | ONBOARDING |
  -- CONVERTED | NOT_INTERESTED | DO_NOT_CONTACT
  -- (+ PARTNERSHIP_DISCUSSION | PARTNER per agenzie, mappati nello stesso campo)
  status text not null default 'NEW',
  agency_name text,
  website text,
  contact_person text,
  linked_user_id uuid references public.users (id) on delete set null,
  linked_landlord_lead_id uuid,
  linked_inquiry_id uuid,
  property_count integer not null default 0,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  do_not_contact boolean not null default false,
  email_opt_out boolean not null default false,
  whatsapp_opt_out boolean not null default false,
  last_contact_method text,
  last_contact_template text,
  last_contact_status text,
  assigned_to uuid references auth.users (id) on delete set null,
  sequence_stopped_at timestamptz,
  sequence_stop_reason text
);

create index if not exists idx_crm_contacts_type on public.crm_contacts (contact_type);
create index if not exists idx_crm_contacts_status on public.crm_contacts (status);
create index if not exists idx_crm_contacts_city on public.crm_contacts (city);
create index if not exists idx_crm_contacts_email on public.crm_contacts (lower(email));
create index if not exists idx_crm_contacts_phone on public.crm_contacts (phone);
create index if not exists idx_crm_contacts_followup on public.crm_contacts (next_follow_up_at);
create index if not exists idx_crm_contacts_last on public.crm_contacts (last_contacted_at);
create index if not exists idx_crm_contacts_search
  on public.crm_contacts using gin (
    to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(phone,'') || ' ' || coalesce(agency_name,''))
  );

alter table public.crm_contacts enable row level security;
drop policy if exists "crm_contacts_deny_all" on public.crm_contacts;
create policy "crm_contacts_deny_all" on public.crm_contacts for all using (false) with check (false);

-- Immobili acquisibili (property leads)
create table if not exists public.crm_property_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text,
  address text,
  city text default 'Ancona',
  price numeric,
  bedrooms integer,
  bathrooms integer,
  description text,
  source_url text,
  source_name text,
  -- OWNER | AGENCY | MANUAL | MARKETPLACE | OTHER
  property_source text default 'MANUAL',
  images jsonb default '[]'::jsonb,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  agency_contact_id uuid references public.crm_contacts (id) on delete set null,
  linked_property_id uuid references public.properties (id) on delete set null,
  linked_external_lead_id uuid,
  -- DISCOVERED | OWNER_UNKNOWN | OWNER_IDENTIFIED | TO_CONTACT | CONTACTED |
  -- INTERESTED | CLAIM_PENDING | CLAIMED | ONBOARDING | PUBLISHED | REJECTED
  status text not null default 'DISCOVERED',
  discovered_at timestamptz not null default now(),
  contacted_at timestamptz,
  claimed_at timestamptz,
  published_at timestamptz,
  notes text
);

create index if not exists idx_crm_property_leads_contact on public.crm_property_leads (contact_id);
create index if not exists idx_crm_property_leads_status on public.crm_property_leads (status);
create index if not exists idx_crm_property_leads_city on public.crm_property_leads (city);

alter table public.crm_property_leads enable row level security;
drop policy if exists "crm_property_leads_deny_all" on public.crm_property_leads;
create policy "crm_property_leads_deny_all" on public.crm_property_leads for all using (false) with check (false);

-- Timeline eventi
create table if not exists public.crm_timeline_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid references public.crm_contacts (id) on delete cascade,
  property_lead_id uuid references public.crm_property_leads (id) on delete set null,
  -- vedi lib/crm/types.ts
  event_type text not null,
  operator_id uuid references auth.users (id) on delete set null,
  source text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_crm_timeline_contact
  on public.crm_timeline_events (contact_id, created_at desc);

alter table public.crm_timeline_events enable row level security;
drop policy if exists "crm_timeline_deny_all" on public.crm_timeline_events;
create policy "crm_timeline_deny_all" on public.crm_timeline_events for all using (false) with check (false);

-- Template email CRM (override)
create table if not exists public.crm_email_templates (
  template_key text primary key,
  subject text not null,
  body_html text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.crm_email_templates enable row level security;
drop policy if exists "crm_email_templates_deny_all" on public.crm_email_templates;
create policy "crm_email_templates_deny_all" on public.crm_email_templates for all using (false) with check (false);

-- Sequenze outreach
create table if not exists public.crm_sequences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  -- OWNER | AGENCY | STUDENT
  audience text not null,
  is_active boolean not null default true,
  -- [{day:0,channel:'email',template:'OWNER_FIRST_EMAIL'}, ...]
  steps jsonb not null default '[]'::jsonb
);

alter table public.crm_sequences enable row level security;
drop policy if exists "crm_sequences_deny_all" on public.crm_sequences;
create policy "crm_sequences_deny_all" on public.crm_sequences for all using (false) with check (false);

create table if not exists public.crm_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  sequence_id uuid not null references public.crm_sequences (id) on delete cascade,
  current_step integer not null default 0,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'stopped')),
  next_run_at timestamptz,
  stopped_at timestamptz,
  stop_reason text,
  unique (contact_id, sequence_id)
);

create index if not exists idx_crm_enrollments_next
  on public.crm_sequence_enrollments (status, next_run_at);

alter table public.crm_sequence_enrollments enable row level security;
drop policy if exists "crm_enrollments_deny_all" on public.crm_sequence_enrollments;
create policy "crm_enrollments_deny_all" on public.crm_sequence_enrollments for all using (false) with check (false);

-- Link partner tracciabili
create table if not exists public.crm_partner_tokens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  token text not null unique,
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  property_lead_id uuid references public.crm_property_leads (id) on delete set null,
  revoked_at timestamptz,
  clicks integer not null default 0,
  last_clicked_at timestamptz
);

create index if not exists idx_crm_partner_tokens_token on public.crm_partner_tokens (token);

alter table public.crm_partner_tokens enable row level security;
drop policy if exists "crm_partner_tokens_deny_all" on public.crm_partner_tokens;
create policy "crm_partner_tokens_deny_all" on public.crm_partner_tokens for all using (false) with check (false);

-- Rate limit / audit leggero
create table if not exists public.crm_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  operator_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_kind text,
  entity_id text,
  metadata jsonb default '{}'::jsonb
);

alter table public.crm_audit_log enable row level security;
drop policy if exists "crm_audit_deny_all" on public.crm_audit_log;
create policy "crm_audit_deny_all" on public.crm_audit_log for all using (false) with check (false);

-- Seed sequenze default (solo se vuoto)
insert into public.crm_sequences (name, audience, steps)
select * from (
  values
    (
      'Owner outreach',
      'OWNER',
      '[
        {"day":0,"channel":"email","template":"OWNER_FIRST_EMAIL"},
        {"day":1,"channel":"whatsapp","template":"OWNER_FIRST_CONTACT"},
        {"day":4,"channel":"email","template":"OWNER_FOLLOW_UP"},
        {"day":8,"channel":"whatsapp","template":"OWNER_FOLLOW_UP"},
        {"day":14,"channel":"stop","template":null}
      ]'::jsonb
    ),
    (
      'Agency outreach',
      'AGENCY',
      '[
        {"day":0,"channel":"email","template":"AGENCY_FIRST_EMAIL"},
        {"day":3,"channel":"email","template":"AGENCY_FOLLOW_UP"},
        {"day":7,"channel":"whatsapp","template":"AGENCY_FIRST_CONTACT"},
        {"day":14,"channel":"stop","template":null}
      ]'::jsonb
    )
) as v(name, audience, steps)
where not exists (select 1 from public.crm_sequences limit 1);
