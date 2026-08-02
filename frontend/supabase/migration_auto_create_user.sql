-- ============================================================================
-- MIGRATION: auto-creazione profilo utente alla registrazione
-- Necessaria ora che abbiamo aggiunto login/registrazione: quando qualcuno
-- si iscrive tramite Supabase Auth, questa funzione copia automaticamente
-- i suoi dati nella tabella public.users (quella collegata al resto dello
-- schema: properties, student_profiles, ecc.).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
