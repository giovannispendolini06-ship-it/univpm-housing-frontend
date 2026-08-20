-- ============================================================================
-- MIGRATION: waitlist invite-a-friend (referral)
-- Ogni iscritto ottiene un referral_code unico; referred_by punta all'invitante.
-- ============================================================================

alter table public.waitlist_signups
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.waitlist_signups(id) on delete set null;

create unique index if not exists idx_waitlist_signups_referral_code
  on public.waitlist_signups (referral_code)
  where referral_code is not null;

create index if not exists idx_waitlist_signups_referred_by
  on public.waitlist_signups (referred_by)
  where referred_by is not null;

-- Backfill codici per righe legacy senza referral_code
update public.waitlist_signups
set referral_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
where referral_code is null;

comment on column public.waitlist_signups.referral_code is
  'Codice pubblico per link invita un amico (/lista-attesa?ref=...)';
comment on column public.waitlist_signups.referred_by is
  'Iscrizione che ha inviato (waitlist_signups.id), se arrivo via link ref';
