-- ============================================================================
-- SECURITY CORRECTIVE: room_applications — students cannot self-accept
-- Replaces open UPDATE-own policy that allowed status = 'accepted' via PostgREST.
-- ============================================================================

alter table public.room_applications enable row level security;

drop policy if exists "room_applications_update_own" on public.room_applications;
drop policy if exists "room_applications_update_own_withdraw" on public.room_applications;
drop policy if exists "room_applications_update_owner" on public.room_applications;
drop policy if exists "room_applications_insert_own" on public.room_applications;

create policy "room_applications_insert_own" on public.room_applications
  for insert with check (
    auth.uid() = student_id
    and status in ('draft', 'submitted')
  );

create policy "room_applications_update_own_withdraw" on public.room_applications
  for update
  using (auth.uid() = student_id)
  with check (
    auth.uid() = student_id
    and status in ('draft', 'submitted', 'withdrawn')
  );

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
