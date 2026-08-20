-- ============================================================================
-- MIGRATION: room_applications (marketplace interest / apply flow)
-- Student applies to a room; landlord/admin review. Coabito is not a party
-- to the eventual lease — this table tracks platform applications only.
-- ============================================================================

create table if not exists public.room_applications (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  student_id   uuid not null references public.users(id) on delete cascade,
  status       text not null default 'submitted'
    check (status in (
      'draft',
      'submitted',
      'under_review',
      'accepted',
      'rejected',
      'withdrawn'
    )),
  message      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (room_id, student_id)
);

create index if not exists idx_room_applications_student
  on public.room_applications (student_id, created_at desc);

create index if not exists idx_room_applications_room
  on public.room_applications (room_id, status);

alter table public.room_applications enable row level security;

-- Students can read and insert their own applications
create policy "room_applications_select_own" on public.room_applications
  for select using (auth.uid() = student_id);

create policy "room_applications_insert_own" on public.room_applications
  for insert with check (
    auth.uid() = student_id
    and status in ('draft', 'submitted')
  );

-- Studente: può solo ritirare (withdrawn) o aggiornare message — mai accepted/rejected.
create policy "room_applications_update_own_withdraw" on public.room_applications
  for update
  using (auth.uid() = student_id)
  with check (
    auth.uid() = student_id
    and status in ('draft', 'submitted', 'withdrawn')
  );

-- Owners can read applications for rooms on their properties
create policy "room_applications_select_owner" on public.room_applications
  for select using (
    exists (
      select 1
      from public.rooms r
      join public.properties p on p.id = r.property_id
      where r.id = room_applications.room_id
        and p.owner_id = auth.uid()
    )
  );

-- Owners: update status on applications for their rooms (not student self-accept)
create policy "room_applications_update_owner" on public.room_applications
  for update
  using (
    exists (
      select 1
      from public.rooms r
      join public.properties p on p.id = r.property_id
      where r.id = room_applications.room_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.rooms r
      join public.properties p on p.id = r.property_id
      where r.id = room_applications.room_id
        and p.owner_id = auth.uid()
    )
  );

comment on table public.room_applications is
  'Marketplace applications: student interest in a room. Not a lease contract.';
