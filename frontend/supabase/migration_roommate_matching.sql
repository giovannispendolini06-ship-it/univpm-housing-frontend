-- ============================================================================
-- Roommate matching (persone-prima-casa): opt-in + mutual interest + peer chat
-- Reuses conversations / peer_messages after mutual accept.
-- Does NOT redesign room_tenancies / tenancy membership.
-- ============================================================================

-- Opt-in: only students with this flag appear in suggestions
alter table public.student_profiles
  add column if not exists open_to_group_matching boolean not null default false;

comment on column public.student_profiles.open_to_group_matching is
  'When true, student is visible in roommate-first matching. Default false (opt-in).';

create index if not exists idx_student_profiles_open_to_group
  on public.student_profiles (open_to_group_matching)
  where open_to_group_matching = true;

-- One-way interest / pass (contact data stays hidden until mutual)
create table if not exists public.roommate_intents (
  id uuid primary key default gen_random_uuid(),
  from_student_id uuid not null references public.users (id) on delete cascade,
  to_student_id uuid not null references public.users (id) on delete cascade,
  status text not null check (status in ('interested', 'passed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommate_intents_no_self check (from_student_id <> to_student_id),
  constraint roommate_intents_unique_pair unique (from_student_id, to_student_id)
);

create index if not exists idx_roommate_intents_to
  on public.roommate_intents (to_student_id, status);
create index if not exists idx_roommate_intents_from
  on public.roommate_intents (from_student_id, status);

alter table public.roommate_intents enable row level security;

drop policy if exists "roommate_intents_select_own" on public.roommate_intents;
create policy "roommate_intents_select_own" on public.roommate_intents
  for select to authenticated
  using (from_student_id = auth.uid() or to_student_id = auth.uid());

drop policy if exists "roommate_intents_insert_own" on public.roommate_intents;
create policy "roommate_intents_insert_own" on public.roommate_intents
  for insert to authenticated
  with check (from_student_id = auth.uid());

drop policy if exists "roommate_intents_update_own" on public.roommate_intents;
create policy "roommate_intents_update_own" on public.roommate_intents
  for update to authenticated
  using (from_student_id = auth.uid())
  with check (from_student_id = auth.uid());

grant select, insert, update on public.roommate_intents to authenticated;
grant all on public.roommate_intents to service_role;

-- Confirmed mutual match (ordered pair student_a_id < student_b_id)
create table if not exists public.roommate_matches (
  id uuid primary key default gen_random_uuid(),
  student_a_id uuid not null references public.users (id) on delete cascade,
  student_b_id uuid not null references public.users (id) on delete cascade,
  conversation_id uuid,
  matched_at timestamptz not null default now(),
  constraint roommate_matches_ordered check (student_a_id < student_b_id),
  constraint roommate_matches_unique unique (student_a_id, student_b_id)
);

create index if not exists idx_roommate_matches_a on public.roommate_matches (student_a_id);
create index if not exists idx_roommate_matches_b on public.roommate_matches (student_b_id);

alter table public.roommate_matches enable row level security;

drop policy if exists "roommate_matches_select_party" on public.roommate_matches;
create policy "roommate_matches_select_party" on public.roommate_matches
  for select to authenticated
  using (student_a_id = auth.uid() or student_b_id = auth.uid());

-- Inserts via service role only (after mutual interest)
grant select on public.roommate_matches to authenticated;
grant all on public.roommate_matches to service_role;

-- Link peer conversations to roommate matches (application_id stays for owner↔)
alter table public.conversations
  add column if not exists roommate_match_id uuid references public.roommate_matches (id) on delete set null;

create index if not exists idx_conversations_roommate_match
  on public.conversations (roommate_match_id)
  where roommate_match_id is not null;

-- Optional shared id when multiple matched students apply to the same room together.
-- Each student still has their own room_applications row (no tenancy redesign).
alter table public.room_applications
  add column if not exists group_id uuid;

create index if not exists idx_room_applications_group
  on public.room_applications (group_id)
  where group_id is not null;

comment on column public.room_applications.group_id is
  'Shared id when matched roommates apply to the same listing together; one row per student.';

-- Harden: other students must NOT read full student_profiles via RLS.
-- Existing own/admin SELECT policies stay; no public/peer SELECT of full profiles.
-- Contact fields (email/phone) live on users — already restricted to own row.
