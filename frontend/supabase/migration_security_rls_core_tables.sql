-- ============================================================================
-- SECURITY CORRECTIVE: RLS for core tables used by the anon/authenticated client
--
-- Dashboard (client) reads: users, chat_messages, student_profiles.
-- Marketplace listings use service role (lib/listings.ts) — properties/rooms
-- are NOT opened to anon so address / monthly_rent_to_owner stay private.
--
-- Idempotent: enable RLS + drop/recreate known policy names.
-- Core CREATE TABLE for users/properties/rooms is not in-repo; this assumes
-- those tables already exist in the Supabase project.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: admin check without RLS recursion on public.users
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Protect privileged columns on public.users (role / verification)
-- Service role (Auth admin API / Next server) may still update them.
-- ---------------------------------------------------------------------------
create or replace function public.protect_users_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- PostgREST service_role JWT, or SQL as table owner / bypass
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role then
      raise exception 'users.role cannot be changed by clients';
    end if;
    if new.verification_status is distinct from old.verification_status
      or new.verification_method is distinct from old.verification_method
      or new.verified_at is distinct from old.verified_at
      or new.verification_note is distinct from old.verification_note
    then
      raise exception 'users verification fields cannot be changed by clients';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_users_privileged_columns on public.users;
create trigger trg_protect_users_privileged_columns
  before update on public.users
  for each row
  execute function public.protect_users_privileged_columns();

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_select_admin" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_select_public" on public.users;
drop policy if exists "Enable read access for all users" on public.users;
drop policy if exists "Public profiles are viewable by everyone" on public.users;

-- Own row (dashboard, middleware, onboarding)
create policy "users_select_own" on public.users
  for select
  to authenticated
  using (id = auth.uid());

create policy "users_select_admin" on public.users
  for select
  to authenticated
  using (public.is_admin());

-- Profile fields only; privileged columns blocked by trigger above
create policy "users_update_own" on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No INSERT/DELETE for JWT roles (created by handle_new_user / service role)

-- ---------------------------------------------------------------------------
-- chat_messages (Vesta thread — student_id scoped)
-- Client dashboard only SELECTs; writes go through /api/chat (service role).
-- ---------------------------------------------------------------------------
alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
drop policy if exists "chat_messages_select_admin" on public.chat_messages;
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
drop policy if exists "chat_messages_all" on public.chat_messages;

create policy "chat_messages_select_own" on public.chat_messages
  for select
  to authenticated
  using (student_id = auth.uid());

create policy "chat_messages_select_admin" on public.chat_messages
  for select
  to authenticated
  using (public.is_admin());

-- No client INSERT/UPDATE/DELETE

-- ---------------------------------------------------------------------------
-- student_profiles
-- ---------------------------------------------------------------------------
alter table public.student_profiles enable row level security;

drop policy if exists "student_profiles_select_own" on public.student_profiles;
drop policy if exists "student_profiles_select_admin" on public.student_profiles;
drop policy if exists "student_profiles_insert_own" on public.student_profiles;
drop policy if exists "student_profiles_update_own" on public.student_profiles;
drop policy if exists "student_profiles_all" on public.student_profiles;

create policy "student_profiles_select_own" on public.student_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "student_profiles_select_admin" on public.student_profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "student_profiles_insert_own" on public.student_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "student_profiles_update_own" on public.student_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- properties — deny anon public SELECT (address / economics stay private).
-- Marketplace uses service role. Owners manage own rows.
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;

drop policy if exists "properties_select_owner" on public.properties;
drop policy if exists "properties_select_admin" on public.properties;
drop policy if exists "properties_insert_owner" on public.properties;
drop policy if exists "properties_update_owner" on public.properties;
drop policy if exists "properties_update_admin" on public.properties;
drop policy if exists "properties_select_public" on public.properties;
drop policy if exists "properties_public_read" on public.properties;

create policy "properties_select_owner" on public.properties
  for select
  to authenticated
  using (owner_id = auth.uid() or public.is_admin());

create policy "properties_insert_owner" on public.properties
  for insert
  to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

create policy "properties_update_owner" on public.properties
  for update
  to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- rooms — same model as properties (no anon listing via PostgREST)
-- ---------------------------------------------------------------------------
alter table public.rooms enable row level security;

drop policy if exists "rooms_select_owner" on public.rooms;
drop policy if exists "rooms_select_admin" on public.rooms;
drop policy if exists "rooms_mutate_owner" on public.rooms;
drop policy if exists "rooms_public_read" on public.rooms;

create policy "rooms_select_owner" on public.rooms
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.properties p
      where p.id = rooms.property_id
        and p.owner_id = auth.uid()
    )
  );

create policy "rooms_mutate_owner" on public.rooms
  for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.properties p
      where p.id = rooms.property_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.properties p
      where p.id = rooms.property_id
        and p.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- match_scores — student reads own scores only
-- ---------------------------------------------------------------------------
alter table public.match_scores enable row level security;

drop policy if exists "match_scores_select_own" on public.match_scores;
drop policy if exists "match_scores_select_admin" on public.match_scores;
drop policy if exists "match_scores_public" on public.match_scores;

create policy "match_scores_select_own" on public.match_scores
  for select
  to authenticated
  using (student_id = auth.uid());

create policy "match_scores_select_admin" on public.match_scores
  for select
  to authenticated
  using (public.is_admin());

-- Writes only via service role (matching engine)

-- ---------------------------------------------------------------------------
-- form_rate_limits — no client access
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.form_rate_limits') is not null then
    execute 'alter table public.form_rate_limits enable row level security';
    -- intentionally no policies for anon/authenticated
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- owner_inquiries / leads_external — lock client; app uses service role
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.owner_inquiries') is not null then
    execute 'alter table public.owner_inquiries enable row level security';
    execute 'drop policy if exists "Anyone can submit inquiry" on public.owner_inquiries';
    execute 'drop policy if exists "owner_inquiries_insert_anon" on public.owner_inquiries';
    execute 'drop policy if exists "Enable insert for all users" on public.owner_inquiries';
    execute 'drop policy if exists "owner_inquiries_select_admin" on public.owner_inquiries';
    execute $p$
      create policy "owner_inquiries_select_admin" on public.owner_inquiries
        for select to authenticated
        using (public.is_admin())
    $p$;
  end if;

  if to_regclass('public.leads_external') is not null then
    execute 'alter table public.leads_external enable row level security';
    execute 'drop policy if exists "leads_external_select_admin" on public.leads_external';
    execute $p$
      create policy "leads_external_select_admin" on public.leads_external
        for select to authenticated
        using (public.is_admin())
    $p$;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- cities / campuses / property_campus_distances (were created without RLS)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.cities') is not null then
    execute 'alter table public.cities enable row level security';
    execute 'drop policy if exists "cities_select_all" on public.cities';
    execute 'drop policy if exists "cities_admin_write" on public.cities';
    execute $p$
      create policy "cities_select_all" on public.cities
        for select to anon, authenticated using (true)
    $p$;
    execute $p$
      create policy "cities_admin_write" on public.cities
        for all to authenticated
        using (public.is_admin())
        with check (public.is_admin())
    $p$;
  end if;

  if to_regclass('public.campuses') is not null then
    execute 'alter table public.campuses enable row level security';
    execute 'drop policy if exists "campuses_select_all" on public.campuses';
    execute 'drop policy if exists "campuses_admin_write" on public.campuses';
    execute $p$
      create policy "campuses_select_all" on public.campuses
        for select to anon, authenticated using (true)
    $p$;
    execute $p$
      create policy "campuses_admin_write" on public.campuses
        for all to authenticated
        using (public.is_admin())
        with check (public.is_admin())
    $p$;
  end if;

  if to_regclass('public.property_campus_distances') is not null then
    execute 'alter table public.property_campus_distances enable row level security';
    execute 'drop policy if exists "pcd_select_all" on public.property_campus_distances';
    execute 'drop policy if exists "pcd_admin_write" on public.property_campus_distances';
    -- Public read of distance metadata only (no property address here)
    execute $p$
      create policy "pcd_select_all" on public.property_campus_distances
        for select to anon, authenticated using (true)
    $p$;
    execute $p$
      create policy "pcd_admin_write" on public.property_campus_distances
        for all to authenticated
        using (public.is_admin())
        with check (public.is_admin())
    $p$;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- property_images: keep public read only for active listings (not all rows)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.property_images') is not null then
    execute 'drop policy if exists "property_images_select_public" on public.property_images';
    execute $p$
      create policy "property_images_select_public" on public.property_images
        for select
        using (
          exists (
            select 1 from public.properties p
            where p.id = property_images.property_id
              and (
                p.status = 'attivo'
                or p.owner_id = auth.uid()
                or public.is_admin()
              )
          )
        )
    $p$;
  end if;
end $$;
