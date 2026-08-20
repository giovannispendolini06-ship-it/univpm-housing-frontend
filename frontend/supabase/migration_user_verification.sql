-- ============================================================================
-- MIGRATION: badge verifica marketplace (studente / proprietario)
-- Coabito non è parte del contratto: la verifica è base di fiducia tra le parti.
-- ============================================================================

alter table public.users
  add column if not exists verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  add column if not exists verification_method text
    check (
      verification_method is null
      or verification_method in (
        'institutional_email',
        'document',
        'ownership_document',
        'manual_admin'
      )
    ),
  add column if not exists verification_note text,
  add column if not exists verified_at timestamptz;

comment on column public.users.verification_status is
  'Badge marketplace: none | pending | verified | rejected';
comment on column public.users.verification_method is
  'Come è stata effettuata la verifica (email istituzionale, documento, admin)';

create index if not exists idx_users_verification_status
  on public.users (verification_status)
  where verification_status <> 'none';
