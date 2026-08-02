-- ============================================================================
-- MIGRATION AGGIUNTIVA: room_tenancies
-- Necessaria perché il matching (requisito 4) deve confrontare le
-- preferenze dello studente anche con i coinquilini GIÀ presenti in una
-- stanza/appartamento. Lo schema originale non modellava "chi vive dove
-- adesso": questa tabella colma il buco.
-- ============================================================================

create table public.room_tenancies (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  student_id   uuid not null references public.users(id) on delete cascade,
  started_at   date not null default current_date,
  ended_at     date,  -- null = coinquilino attualmente in casa

  created_at   timestamptz not null default now(),

  constraint room_tenancies_dates_check check (ended_at is null or ended_at >= started_at)
);

create index idx_room_tenancies_room_id on public.room_tenancies (room_id);
create index idx_room_tenancies_student_id on public.room_tenancies (student_id);
create index idx_room_tenancies_active on public.room_tenancies (room_id) where ended_at is null;

alter table public.room_tenancies enable row level security;

-- Solo il proprietario dell'immobile e lo studente coinvolto possono leggere
create policy "room_tenancies_select" on public.room_tenancies
  for select using (
    auth.uid() = student_id
    or exists (
      select 1 from public.rooms r
      join public.properties p on p.id = r.property_id
      where r.id = room_tenancies.room_id and p.owner_id = auth.uid()
    )
  );

-- Aggiunta comoda anche a student_profiles per la data d'ingresso raccolta
-- dalla chat (vedi system prompt Dado, campo preferred_move_in_date)
alter table public.student_profiles
  add column if not exists preferred_move_in_date date;
