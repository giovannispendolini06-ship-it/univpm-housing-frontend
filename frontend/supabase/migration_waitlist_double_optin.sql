-- ============================================================================
-- MIGRATION: waitlist double opt-in
-- Aggiunge conferma email (DOI) su waitlist_signups.
-- - Iscrizioni con email: pending finché non cliccano il link
-- - Solo telefono / Vesta (account già verificato): confirmed_at subito
-- - Token scadono dopo 7 giorni (non cancelliamo la riga)
-- ============================================================================

alter table public.waitlist_signups
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmation_token text,
  add column if not exists confirmation_sent_at timestamptz,
  add column if not exists confirmation_expires_at timestamptz;

create unique index if not exists idx_waitlist_signups_confirmation_token
  on public.waitlist_signups (confirmation_token)
  where confirmation_token is not null;

create index if not exists idx_waitlist_signups_confirmed_at
  on public.waitlist_signups (confirmed_at);

-- Righe legacy (pre-DOI): già iscritte via form → considerale confermate
update public.waitlist_signups
  set confirmed_at = coalesce(confirmed_at, created_at)
  where confirmed_at is null
    and confirmation_token is null;
