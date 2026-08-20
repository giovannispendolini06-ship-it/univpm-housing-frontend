-- ============================================================================
-- SECURITY CORRECTIVE: lock down handle_new_user role assignment
-- Apply on existing projects where migration_auto_create_user.sql already ran.
-- Admin MUST never come from Auth user metadata / client signup.
-- ============================================================================

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
    when new.raw_user_meta_data->>'role' in ('student', 'owner')
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
  'Copies auth.users → public.users. Role limited to student|owner; admin only via ops SQL.';
