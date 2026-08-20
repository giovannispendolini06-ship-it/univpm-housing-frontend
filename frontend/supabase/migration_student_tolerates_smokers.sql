-- Optional lifestyle field used by Compatibilità Coabito hard constraints.
alter table public.student_profiles
  add column if not exists tolerates_smokers boolean;
