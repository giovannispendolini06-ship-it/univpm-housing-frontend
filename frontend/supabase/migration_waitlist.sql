-- ============================================================================
-- MIGRATION: waitlist_signups
-- Raccolta di studenti interessati (form leggero /lista-attesa + fallback
-- Vesta quando non ci sono stanze compatibili). Unifica le due fonti.
-- ============================================================================

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identità / contatto
  nome text not null,
  email text,
  phone text,
  user_id uuid references public.users(id) on delete set null,

  -- Preferenze abitative
  facolta text,
  polo text, -- codice: monte_dago | torrette | centro_economia_giurisprudenza | altro
  budget integer,
  study_habit text,
  sociability_level integer,
  guests_frequency text,
  cleanliness_level integer,
  preferred_contact text, -- email | whatsapp | phone

  -- Provenienza e gestione admin
  source text not null default 'lista_attesa',
  -- es. lista_attesa | vesta_chat | instagram | whatsapp | telegram | altro
  contattato boolean not null default false,
  note text,

  constraint waitlist_contact_present check (
    (email is not null and length(trim(email)) > 0)
    or (phone is not null and length(trim(phone)) > 0)
  )
);

create index if not exists idx_waitlist_signups_created_at
  on public.waitlist_signups (created_at desc);
create index if not exists idx_waitlist_signups_source
  on public.waitlist_signups (source);
create index if not exists idx_waitlist_signups_polo
  on public.waitlist_signups (polo);
create index if not exists idx_waitlist_signups_contattato
  on public.waitlist_signups (contattato);
create index if not exists idx_waitlist_signups_user_id
  on public.waitlist_signups (user_id);

-- Un solo record "attivo" per utente autenticato (fallback Vesta):
-- se lo studente riapre la chat, aggiorniamo la riga esistente.
create unique index if not exists idx_waitlist_signups_user_unique
  on public.waitlist_signups (user_id)
  where user_id is not null;

alter table public.waitlist_signups enable row level security;

-- SECURITY: nessun INSERT/SELECT/UPDATE/DELETE per anon|authenticated.
-- Iscrizione solo via Server Action con service role (DOI + campi interni
-- gestiti server-side). Evita bypass di confirmed_at / confirmation_token.
drop policy if exists "Anyone can join waitlist" on public.waitlist_signups;

-- Lettura/aggiornamento solo via service role (admin) — nessuna policy
-- per anon/authenticated: il pannello admin usa createServiceSupabaseClient.
