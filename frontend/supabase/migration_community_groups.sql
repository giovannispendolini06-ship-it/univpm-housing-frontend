-- ============================================================================
-- Community groups (city / university boards)
-- Passive bulletin for students before they actively search housing.
-- Seed: Ancona only for now; structure ready for more cities.
-- ============================================================================

create table if not exists public.community_groups (
  id uuid primary key default gen_random_uuid(),
  -- slugs aligned with cities.slug / universities.slug
  city text not null,
  university text, -- null = city-wide group
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- NULL university = city-wide; coalesce so only one city-wide row per city
create unique index if not exists community_groups_city_uni_uidx
  on public.community_groups (city, (coalesce(university, '')));

create index if not exists idx_community_groups_city
  on public.community_groups (city);

create table if not exists public.community_group_members (
  group_id uuid not null references public.community_groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists idx_community_group_members_user
  on public.community_group_members (user_id);

-- Sticky leave: auto-join must not re-add users who left a group manually
create table if not exists public.community_group_opt_outs (
  group_id uuid not null references public.community_groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  left_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.community_group_opt_outs enable row level security;

drop policy if exists "community_opt_outs_select_own" on public.community_group_opt_outs;
create policy "community_opt_outs_select_own" on public.community_group_opt_outs
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "community_opt_outs_insert_own" on public.community_group_opt_outs;
create policy "community_opt_outs_insert_own" on public.community_group_opt_outs
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "community_opt_outs_delete_own" on public.community_group_opt_outs;
create policy "community_opt_outs_delete_own" on public.community_group_opt_outs
  for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.community_group_opt_outs to authenticated;
grant all on public.community_group_opt_outs to service_role;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.community_groups (id) on delete cascade,
  author_id uuid not null references public.users (id) on delete cascade,
  content text not null
    check (char_length(btrim(content)) >= 1 and char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_community_posts_group_created
  on public.community_posts (group_id, created_at desc);

alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;
alter table public.community_posts enable row level security;

-- Groups: authenticated students can list (discover / join)
drop policy if exists "community_groups_select_auth" on public.community_groups;
create policy "community_groups_select_auth" on public.community_groups
  for select to authenticated
  using (true);

-- Members: see own memberships; see fellow members of groups you belong to
drop policy if exists "community_members_select_own_or_peers" on public.community_group_members;
create policy "community_members_select_own_or_peers" on public.community_group_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.community_group_members me
      where me.group_id = community_group_members.group_id
        and me.user_id = auth.uid()
    )
  );

drop policy if exists "community_members_insert_own" on public.community_group_members;
create policy "community_members_insert_own" on public.community_group_members
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "community_members_delete_own" on public.community_group_members;
create policy "community_members_delete_own" on public.community_group_members
  for delete to authenticated
  using (user_id = auth.uid());

-- Posts: only members of the group can read/write
drop policy if exists "community_posts_select_member" on public.community_posts;
create policy "community_posts_select_member" on public.community_posts
  for select to authenticated
  using (
    exists (
      select 1 from public.community_group_members m
      where m.group_id = community_posts.group_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "community_posts_insert_member" on public.community_posts;
create policy "community_posts_insert_member" on public.community_posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.community_group_members m
      where m.group_id = community_posts.group_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own" on public.community_posts
  for delete to authenticated
  using (author_id = auth.uid());

grant select on public.community_groups to authenticated;
grant select, insert, delete on public.community_group_members to authenticated;
grant select, insert, delete on public.community_posts to authenticated;
grant all on public.community_groups to service_role;
grant all on public.community_group_members to service_role;
grant all on public.community_posts to service_role;

-- Seed Ancona (city-wide + Univpm). Idempotent via NOT EXISTS
-- (expression unique index is not a clean ON CONFLICT target).
insert into public.community_groups (city, university, name, description)
select
  'ancona',
  null,
  'Studenti ad Ancona',
  'Bacheca aperta a chi studia o si trasferisce ad Ancona — ancora prima di cercare casa.'
where not exists (
  select 1 from public.community_groups g
  where g.city = 'ancona' and g.university is null
);

insert into public.community_groups (city, university, name, description)
select
  'ancona',
  'univpm',
  'Univpm · Ancona',
  'Spazio per chi è (o sarà) all''Università Politecnica delle Marche: tip, quartieri, coinquilini.'
where not exists (
  select 1 from public.community_groups g
  where g.city = 'ancona' and g.university = 'univpm'
);

comment on table public.community_groups is
  'City/university community boards. university null = city-wide.';
comment on table public.community_posts is
  'Short text posts; members only (RLS). No nested comments in v1.';
