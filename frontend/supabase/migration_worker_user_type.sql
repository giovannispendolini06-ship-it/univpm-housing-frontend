-- ============================================================================
-- Workers (lavoratori) as first-class seekers alongside students.
-- Same inventory + student_profiles table; role distinguishes matching weights
-- and which onboarding fields are required (university/campus only for students).
-- ============================================================================

-- Extend enum used by public.users.role (name may be user_role on older DBs).
do $$
begin
  if exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role' and n.nspname = 'public'
  ) then
    begin
      alter type public.user_role add value if not exists 'worker';
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- Worker-oriented optional fields on the shared seeker profile table
alter table public.student_profiles
  add column if not exists job_sector text,
  add column if not exists smart_working_preference text
    check (
      smart_working_preference is null
      or smart_working_preference in ('never', 'hybrid', 'mostly', 'full')
    ),
  add column if not exists work_hours_notes text;

comment on column public.student_profiles.job_sector is
  'Optional job sector / role for worker seekers.';
comment on column public.student_profiles.smart_working_preference is
  'Worker quiet/WFH preference: never|hybrid|mostly|full.';
comment on column public.student_profiles.work_hours_notes is
  'Optional indicative work schedule notes for workers.';

-- Allow worker in handle_new_user (student|worker|owner only; never admin from client)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_role text;
begin
  safe_role := case
    when new.raw_user_meta_data->>'role' in ('student', 'worker', 'owner')
      then new.raw_user_meta_data->>'role'
    else 'student'
  end;

  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    safe_role::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Copies auth.users → public.users. Role limited to student|worker|owner; admin only via ops SQL.';
