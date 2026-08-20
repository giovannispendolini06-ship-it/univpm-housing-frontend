-- ============================================================================
-- MIGRATION: multi-city campuses
-- Introduces cities, campuses, and property_campus_distances while keeping
-- legacy columns (city text, distance_*, polo_univpm) for forms and Vesta.
-- ============================================================================

create table public.cities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.campuses (
  id         uuid primary key default gen_random_uuid(),
  city_id    uuid not null references public.cities(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

create table public.property_campus_distances (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  campus_id   uuid not null references public.campuses(id) on delete cascade,
  distance_km numeric(5, 2),
  created_at  timestamptz not null default now(),
  unique (property_id, campus_id)
);

create index idx_campuses_city_id on public.campuses (city_id);
create index idx_property_campus_distances_property_id
  on public.property_campus_distances (property_id);
create index idx_property_campus_distances_campus_id
  on public.property_campus_distances (campus_id);

alter table public.properties
  add column if not exists city_id uuid references public.cities(id);

alter table public.student_profiles
  add column if not exists campus_id uuid references public.campuses(id);

create index idx_properties_city_id on public.properties (city_id);
create index idx_student_profiles_campus_id on public.student_profiles (campus_id);

-- Seed Ancona and its three UNIVPM campuses
insert into public.cities (name)
values ('Ancona')
on conflict (name) do nothing;

insert into public.campuses (city_id, name)
select c.id, campus_name
from public.cities c
cross join (
  values
    ('Monte Dago'),
    ('Torrette'),
    ('Centro (Economia/Giurisprudenza)')
) as t(campus_name)
where c.name = 'Ancona'
on conflict (city_id, name) do nothing;

-- Backfill properties.city_id from legacy city text
update public.properties p
set city_id = c.id
from public.cities c
where p.city = 'Ancona'
  and c.name = 'Ancona'
  and p.city_id is null;

-- Copy legacy distance_* columns into property_campus_distances
insert into public.property_campus_distances (property_id, campus_id, distance_km)
select p.id, camp.id, p.distance_monte_dago_km
from public.properties p
join public.campuses camp on camp.name = 'Monte Dago'
join public.cities c on c.id = camp.city_id and c.name = 'Ancona'
where p.distance_monte_dago_km is not null
on conflict (property_id, campus_id) do update
  set distance_km = excluded.distance_km;

insert into public.property_campus_distances (property_id, campus_id, distance_km)
select p.id, camp.id, p.distance_torrette_km
from public.properties p
join public.campuses camp on camp.name = 'Torrette'
join public.cities c on c.id = camp.city_id and c.name = 'Ancona'
where p.distance_torrette_km is not null
on conflict (property_id, campus_id) do update
  set distance_km = excluded.distance_km;

insert into public.property_campus_distances (property_id, campus_id, distance_km)
select p.id, camp.id, p.distance_centro_km
from public.properties p
join public.campuses camp on camp.name = 'Centro (Economia/Giurisprudenza)'
join public.cities c on c.id = camp.city_id and c.name = 'Ancona'
where p.distance_centro_km is not null
on conflict (property_id, campus_id) do update
  set distance_km = excluded.distance_km;

-- Map legacy polo_univpm values to campus_id where possible
update public.student_profiles sp
set campus_id = camp.id
from public.campuses camp
join public.cities c on c.id = camp.city_id
where c.name = 'Ancona'
  and sp.polo_univpm = 'monte_dago'
  and camp.name = 'Monte Dago'
  and sp.campus_id is null;

update public.student_profiles sp
set campus_id = camp.id
from public.campuses camp
join public.cities c on c.id = camp.city_id
where c.name = 'Ancona'
  and sp.polo_univpm = 'torrette'
  and camp.name = 'Torrette'
  and sp.campus_id is null;

update public.student_profiles sp
set campus_id = camp.id
from public.campuses camp
join public.cities c on c.id = camp.city_id
where c.name = 'Ancona'
  and sp.polo_univpm = 'centro_economia_giurisprudenza'
  and camp.name = 'Centro (Economia/Giurisprudenza)'
  and sp.campus_id is null;

-- RLS: reference geo tables (writes via service role / later admin policies)
alter table public.cities enable row level security;
alter table public.campuses enable row level security;
alter table public.property_campus_distances enable row level security;

drop policy if exists "cities_select_all" on public.cities;
create policy "cities_select_all" on public.cities
  for select to anon, authenticated using (true);

drop policy if exists "campuses_select_all" on public.campuses;
create policy "campuses_select_all" on public.campuses
  for select to anon, authenticated using (true);

drop policy if exists "pcd_select_all" on public.property_campus_distances;
create policy "pcd_select_all" on public.property_campus_distances
  for select to anon, authenticated using (true);
