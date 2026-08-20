-- ============================================================================
-- MIGRATION: waitlist nurture sequence
-- Dopo double opt-in (o conferma immediata con email), programma 2 email
-- di nutrimento (default +3g / +10g dalla conferma). Si interrompe se
-- l'utente riceve una notifica di stanza compatibile.
-- ============================================================================

alter table public.waitlist_signups
  add column if not exists nurture_step smallint not null default 0,
  add column if not exists next_nurture_at timestamptz,
  add column if not exists nurture_stopped_at timestamptz,
  add column if not exists nurture_1_sent_at timestamptz,
  add column if not exists nurture_2_sent_at timestamptz,
  add column if not exists preferred_locale text not null default 'it';

-- Vincoli soft: step 0..2 (applicati in app; check opzionale)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'waitlist_nurture_step_range'
  ) then
    alter table public.waitlist_signups
      add constraint waitlist_nurture_step_range
      check (nurture_step >= 0 and nurture_step <= 2);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'waitlist_preferred_locale_check'
  ) then
    alter table public.waitlist_signups
      add constraint waitlist_preferred_locale_check
      check (preferred_locale in ('it', 'en'));
  end if;
end $$;

create index if not exists idx_waitlist_signups_next_nurture_at
  on public.waitlist_signups (next_nurture_at)
  where next_nurture_at is not null and nurture_stopped_at is null;

comment on column public.waitlist_signups.nurture_step is
  '0 = nessuna nurture inviata; 1 = prima inviata; 2 = sequenza completata';
comment on column public.waitlist_signups.next_nurture_at is
  'Prossimo invio nurture (null se completata/fermata/non programmata)';
comment on column public.waitlist_signups.nurture_stopped_at is
  'Sequenza interrotta (es. notifica stanza compatibile ricevuta)';
