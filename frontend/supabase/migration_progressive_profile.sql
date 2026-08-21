-- ============================================================================
-- Progressive profile fields (students + owners)
-- Signup stays light (name/email/password/role/consent).
-- Extra KYC-lite collected over time on /profilo.
-- ============================================================================

alter table public.users
  add column if not exists last_name text,
  add column if not exists place_of_birth text,
  add column if not exists sex text
    check (
      sex is null
      or sex in ('F', 'M', 'X', 'prefer_not')
    ),
  add column if not exists has_guarantor boolean,
  add column if not exists iban text,
  add column if not exists company_name text;

comment on column public.users.last_name is
  'Cognome (progressivo; signup salva solo il nome in full_name)';
comment on column public.users.place_of_birth is
  'Luogo di nascita — propedeutico al CF in candidatura';
comment on column public.users.sex is
  'Sesso anagrafico F|M|X|prefer_not — propedeutico al CF';
comment on column public.users.has_guarantor is
  'Studente: disponibilità di un garante';
comment on column public.users.iban is
  'Proprietario: IBAN per ricezione canone';
comment on column public.users.company_name is
  'Proprietario: ragione sociale (alternativa a persona fisica)';
