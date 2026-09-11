-- ============================================================================
-- Property typology + structured contract duration (student vs worker listings).
-- Backfills from legacy contract_type / min_contract_months / transitorio.
-- ============================================================================

alter table public.properties
  add column if not exists property_type text
  check (
    property_type is null
    or property_type in (
      'stanza_singola',
      'stanza_doppia',
      'appartamento_intero',
      'monolocale'
    )
  );

alter table public.properties
  add column if not exists contract_duration_type text
  check (
    contract_duration_type is null
    or contract_duration_type in (
      'anno_accademico',
      'annuale',
      'breve_periodo',
      'flessibile'
    )
  );

alter table public.properties
  add column if not exists available_until date;

comment on column public.properties.property_type is
  'stanza_singola | stanza_doppia | appartamento_intero | monolocale';
comment on column public.properties.contract_duration_type is
  'anno_accademico | annuale | breve_periodo | flessibile — /stanze filters';
comment on column public.properties.available_until is
  'Optional end of availability / intended stay window';

update public.properties
set property_type = case
  when contract_type = 'stanza_doppia' then 'stanza_doppia'
  when contract_type in ('intero_appartamento', 'appartamento_intero') then 'appartamento_intero'
  when contract_type = 'monolocale' then 'monolocale'
  when contract_type = 'stanza_singola' then 'stanza_singola'
  else coalesce(property_type, 'stanza_singola')
end
where property_type is null;

update public.properties
set contract_duration_type = case
  when contract_type = 'transitorio' then 'breve_periodo'
  when min_contract_months is not null and min_contract_months <= 6 then 'breve_periodo'
  when min_contract_months is not null and min_contract_months >= 11 then 'annuale'
  when min_contract_months is not null and min_contract_months between 7 and 10
    then 'anno_accademico'
  else coalesce(contract_duration_type, 'anno_accademico')
end
where contract_duration_type is null;

-- Whole units: no flatmates implied
update public.properties
set total_rooms = 1
where property_type in ('appartamento_intero', 'monolocale')
  and (total_rooms is null or total_rooms < 1);

-- Optional employer declaration for worker seekers (not required at signup)
alter table public.student_profiles
  add column if not exists employer_name text;

comment on column public.student_profiles.employer_name is
  'Optional employer / company name declared by worker seekers (trust signal).';

-- Extend verification_method for worker soft-trust paths
do $$
begin
  alter table public.users drop constraint if exists users_verification_method_check;
exception when undefined_object then null;
end $$;

alter table public.users
  add constraint users_verification_method_check
  check (
    verification_method is null
    or verification_method in (
      'institutional_email',
      'document',
      'ownership_document',
      'manual_admin',
      'corporate_email',
      'employer_declaration'
    )
  );
