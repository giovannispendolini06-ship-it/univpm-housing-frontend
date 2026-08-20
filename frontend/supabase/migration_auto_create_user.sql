-- ============================================================================
-- MIGRATION: auto-creazione profilo utente alla registrazione
-- Necessaria ora che abbiamo aggiunto login/registrazione: quando qualcuno
-- si iscrive tramite Supabase Auth, questa funzione copia automaticamente
-- i suoi dati nella tabella public.users (quella collegata al resto dello
-- schema: properties, student_profiles, ecc.).
--
-- SECURITY: role da metadata SOLO student|owner. Mai admin (solo SQL/ops).
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
  -- Non fidarsi di raw_user_meta_data per privilegi: admin non è mai ammesso qui.
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
