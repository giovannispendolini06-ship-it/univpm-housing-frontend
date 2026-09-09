-- ============================================================================
-- MIGRATION: geo country + universities + national city seed
-- Extends cities/campuses for multi-city Vesta. country_code ready for EU/UK.
-- Only Ancona is operational (cities.status = 'active').
-- ============================================================================

alter table public.cities
  add column if not exists country_code text not null default 'IT',
  add column if not exists slug text,
  add column if not exists region text,
  add column if not exists status text not null default 'coming_soon';

alter table public.cities drop constraint if exists cities_status_check;
alter table public.cities
  add constraint cities_status_check
  check (status in ('active', 'coming_soon'));

create unique index if not exists cities_slug_uidx on public.cities (slug)
  where slug is not null;

create table if not exists public.universities (
  id         uuid primary key default gen_random_uuid(),
  city_id    uuid not null references public.cities(id) on delete cascade,
  name       text not null,
  slug       text not null,
  created_at timestamptz not null default now(),
  unique (city_id, name),
  unique (city_id, slug)
);

create index if not exists idx_universities_city_id on public.universities (city_id);

alter table public.campuses
  add column if not exists university_id uuid references public.universities(id) on delete set null,
  add column if not exists slug text;

create unique index if not exists campuses_university_slug_uidx
  on public.campuses (university_id, slug)
  where university_id is not null and slug is not null;

alter table public.student_profiles
  add column if not exists city_id uuid references public.cities(id),
  add column if not exists university_id uuid references public.universities(id),
  add column if not exists city_slug text,
  add column if not exists university_slug text,
  add column if not exists pole_slug text;

create index if not exists idx_student_profiles_city_id on public.student_profiles (city_id);
create index if not exists idx_student_profiles_university_id on public.student_profiles (university_id);

alter table public.universities enable row level security;
drop policy if exists "universities_select_all" on public.universities;
create policy "universities_select_all" on public.universities
  for select to anon, authenticated using (true);

-- Seed / upsert cities from app catalog

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Ancona', 'ancona', 'Marche', 'IT', 'active', true)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Urbino', 'urbino', 'Marche', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Macerata', 'macerata', 'Marche', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Camerino', 'camerino', 'Marche', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Torino', 'torino', 'Piemonte', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Milano', 'milano', 'Lombardia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Pavia', 'pavia', 'Lombardia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Bergamo', 'bergamo', 'Lombardia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Brescia', 'brescia', 'Lombardia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Varese / Como', 'varese-como', 'Lombardia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Padova', 'padova', 'Veneto', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Venezia', 'venezia', 'Veneto', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Verona', 'verona', 'Veneto', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Trento', 'trento', 'Trentino-Alto Adige', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Bolzano', 'bolzano', 'Trentino-Alto Adige', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Trieste', 'trieste', 'Friuli-Venezia Giulia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Udine', 'udine', 'Friuli-Venezia Giulia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Genova', 'genova', 'Liguria', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Bologna', 'bologna', 'Emilia-Romagna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Parma', 'parma', 'Emilia-Romagna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Modena e Reggio Emilia', 'modena-reggio', 'Emilia-Romagna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Ferrara', 'ferrara', 'Emilia-Romagna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Firenze', 'firenze', 'Toscana', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Pisa', 'pisa', 'Toscana', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Siena', 'siena', 'Toscana', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Arezzo', 'arezzo', 'Toscana', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Perugia', 'perugia', 'Umbria', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Roma', 'roma', 'Lazio', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Viterbo', 'viterbo', 'Lazio', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Cassino', 'cassino', 'Lazio', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('L''Aquila', 'laquila', 'Abruzzo', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Chieti-Pescara', 'chieti-pescara', 'Abruzzo', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Teramo', 'teramo', 'Abruzzo', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Campobasso', 'campobasso', 'Molise', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Napoli', 'napoli', 'Campania', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Salerno', 'salerno', 'Campania', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Benevento', 'benevento', 'Campania', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Caserta', 'caserta', 'Campania', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Bari', 'bari', 'Puglia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Lecce', 'lecce', 'Puglia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Foggia', 'foggia', 'Puglia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Potenza', 'potenza', 'Basilicata', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Cosenza', 'cosenza', 'Calabria', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Reggio Calabria', 'reggio-calabria', 'Calabria', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Catanzaro', 'catanzaro', 'Calabria', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Palermo', 'palermo', 'Sicilia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Catania', 'catania', 'Sicilia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Messina', 'messina', 'Sicilia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Enna', 'enna', 'Sicilia', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Cagliari', 'cagliari', 'Sardegna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;

insert into public.cities (name, slug, region, country_code, status, is_active)
values ('Sassari', 'sassari', 'Sardegna', 'IT', 'coming_soon', false)
on conflict (name) do update set
  slug = excluded.slug,
  region = excluded.region,
  country_code = excluded.country_code,
  status = excluded.status,
  is_active = excluded.is_active;


-- Universities + poles

insert into public.universities (city_id, name, slug)
select c.id, 'Università Politecnica delle Marche', 'univpm'
from public.cities c
where c.slug = 'ancona'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Monte Dago', 'monte_dago'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Torrette', 'torrette'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro (Economia/Giurisprudenza)', 'villarey'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Urbino Carlo Bo', 'uniurb'
from public.cities c
where c.slug = 'urbino'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Macerata', 'unimc'
from public.cities c
where c.slug = 'macerata'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Camerino', 'unicam'
from public.cities c
where c.slug = 'camerino'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Torino', 'unito'
from public.cities c
where c.slug = 'torino'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Campus Luigi Einaudi', 'cle'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unito'
where c.slug = 'torino'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Molinette (Medicina)', 'molinette'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unito'
where c.slug = 'torino'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Politecnico di Torino', 'polito'
from public.cities c
where c.slug = 'torino'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Cittadella Politecnico', 'cittadella'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'polito'
where c.slug = 'torino'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università degli Studi di Milano (Statale)', 'unimi'
from public.cities c
where c.slug = 'milano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Città Studi', 'citta_studi'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unimi'
where c.slug = 'milano'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Milano-Bicocca', 'unimib'
from public.cities c
where c.slug = 'milano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Bicocca', 'bicocca'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unimib'
where c.slug = 'milano'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Politecnico di Milano', 'polimi'
from public.cities c
where c.slug = 'milano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Città Studi', 'citta_studi'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'polimi'
where c.slug = 'milano'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Bocconi', 'bocconi'
from public.cities c
where c.slug = 'milano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Porta Romana / Bocconi', 'porta_romana'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'bocconi'
where c.slug = 'milano'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Cattolica del Sacro Cuore', 'unicatt-mi'
from public.cities c
where c.slug = 'milano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unicatt-mi'
where c.slug = 'milano'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Pavia', 'unipv'
from public.cities c
where c.slug = 'pavia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Bergamo', 'unibg'
from public.cities c
where c.slug = 'bergamo'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Brescia', 'unibs'
from public.cities c
where c.slug = 'brescia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università dell''Insubria', 'uninsubria'
from public.cities c
where c.slug = 'varese-como'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Padova', 'unipd'
from public.cities c
where c.slug = 'padova'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipd'
where c.slug = 'padova'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Agripolis (Agraria)', 'agripolis'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipd'
where c.slug = 'padova'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Terza Torre (Ingegneria)', 'terza_torre'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipd'
where c.slug = 'padova'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Ca'' Foscari Venezia', 'unive'
from public.cities c
where c.slug = 'venezia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Iuav di Venezia', 'iuav'
from public.cities c
where c.slug = 'venezia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Verona', 'univr'
from public.cities c
where c.slug = 'verona'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Trento', 'unitn'
from public.cities c
where c.slug = 'trento'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Libera Università di Bolzano', 'unibz'
from public.cities c
where c.slug = 'bolzano'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Trieste', 'units'
from public.cities c
where c.slug = 'trieste'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Udine', 'uniud'
from public.cities c
where c.slug = 'udine'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Genova', 'unige'
from public.cities c
where c.slug = 'genova'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Bologna', 'unibo'
from public.cities c
where c.slug = 'bologna'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Scienze (Zona universitaria / San Donato)', 'scienze'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Ingegneria (Zona universitaria)', 'ingegneria'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Economia (San Donato)', 'economia'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Medicina (Policlinico Sant''Orsola)', 'medicina'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Giurisprudenza (centro)', 'giurisprudenza'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Lettere (centro)', 'lettere'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unibo'
where c.slug = 'bologna'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Parma', 'unipr'
from public.cities c
where c.slug = 'parma'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università degli Studi di Modena e Reggio Emilia', 'unimore'
from public.cities c
where c.slug = 'modena-reggio'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Ferrara', 'unife'
from public.cities c
where c.slug = 'ferrara'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Firenze', 'unifi'
from public.cities c
where c.slug = 'firenze'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unifi'
where c.slug = 'firenze'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Careggi (Medicina)', 'careggi'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unifi'
where c.slug = 'firenze'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Novoli (Scienze sociali)', 'novoli'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unifi'
where c.slug = 'firenze'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Pisa', 'unipi'
from public.cities c
where c.slug = 'pisa'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipi'
where c.slug = 'pisa'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'San Rossore (Ingegneria)', 'san_rossore'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipi'
where c.slug = 'pisa'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Cisanello (Medicina)', 'cisanello'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipi'
where c.slug = 'pisa'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Scuola Normale Superiore', 'sns'
from public.cities c
where c.slug = 'pisa'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Scuola Superiore Sant''Anna', 'santanna'
from public.cities c
where c.slug = 'pisa'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Siena', 'unisi'
from public.cities c
where c.slug = 'siena'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Siena (sede di Arezzo)', 'unisi-arezzo'
from public.cities c
where c.slug = 'arezzo'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Perugia', 'unipg'
from public.cities c
where c.slug = 'perugia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipg'
where c.slug = 'perugia'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Monteluce', 'monteluce'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipg'
where c.slug = 'perugia'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Sapienza Università di Roma', 'uniroma1'
from public.cities c
where c.slug = 'roma'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'San Lorenzo / Città Universitaria', 'san_lorenzo'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'uniroma1'
where c.slug = 'roma'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Roma Tre', 'uniroma3'
from public.cities c
where c.slug = 'roma'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Ostiense', 'ostiense'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'uniroma3'
where c.slug = 'roma'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Roma Tor Vergata', 'uniroma2'
from public.cities c
where c.slug = 'roma'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Tor Vergata (sud-est)', 'tor_vergata'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'uniroma2'
where c.slug = 'roma'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'LUISS Guido Carli', 'luiss'
from public.cities c
where c.slug = 'roma'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Parioli', 'parioli'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'luiss'
where c.slug = 'roma'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università della Tuscia', 'unitus'
from public.cities c
where c.slug = 'viterbo'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Cassino e del Lazio Meridionale', 'unicas'
from public.cities c
where c.slug = 'cassino'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università dell''Aquila', 'univaq'
from public.cities c
where c.slug = 'laquila'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università degli Studi "G. d''Annunzio" Chieti-Pescara', 'unich'
from public.cities c
where c.slug = 'chieti-pescara'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Teramo', 'unite'
from public.cities c
where c.slug = 'teramo'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università del Molise', 'unimol'
from public.cities c
where c.slug = 'campobasso'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Napoli Federico II', 'unina'
from public.cities c
where c.slug = 'napoli'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unina'
where c.slug = 'napoli'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Fuorigrotta (Ingegneria)', 'fuorigrotta'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unina'
where c.slug = 'napoli'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Policlinico', 'policlinico'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unina'
where c.slug = 'napoli'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Napoli Parthenope', 'uniparthenope'
from public.cities c
where c.slug = 'napoli'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università della Campania Luigi Vanvitelli', 'unicampania'
from public.cities c
where c.slug = 'napoli'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Salerno', 'unisa'
from public.cities c
where c.slug = 'salerno'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università del Sannio', 'unisannio'
from public.cities c
where c.slug = 'benevento'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università della Campania Luigi Vanvitelli (Caserta)', 'unicampania-caserta'
from public.cities c
where c.slug = 'caserta'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Bari Aldo Moro', 'uniba'
from public.cities c
where c.slug = 'bari'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Poggiofranco', 'poggiofranco'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'uniba'
where c.slug = 'bari'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro (Giurisprudenza / Economia)', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'uniba'
where c.slug = 'bari'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Politecnico di Bari', 'poliba'
from public.cities c
where c.slug = 'bari'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università del Salento', 'unisalento'
from public.cities c
where c.slug = 'lecce'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Foggia', 'unifg'
from public.cities c
where c.slug = 'foggia'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università della Basilicata', 'unibas'
from public.cities c
where c.slug = 'potenza'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università della Calabria', 'unical'
from public.cities c
where c.slug = 'cosenza'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università Mediterranea di Reggio Calabria', 'unirc'
from public.cities c
where c.slug = 'reggio-calabria'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università "Magna Graecia" di Catanzaro', 'unicz'
from public.cities c
where c.slug = 'catanzaro'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Palermo', 'unipa'
from public.cities c
where c.slug = 'palermo'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Viale delle Scienze', 'viale_delle_scienze'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipa'
where c.slug = 'palermo'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unipa'
where c.slug = 'palermo'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Catania', 'unict'
from public.cities c
where c.slug = 'catania'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unict'
where c.slug = 'catania'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Città Universitaria (viale Andrea Doria)', 'citta_universitaria'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unict'
where c.slug = 'catania'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Messina', 'unime'
from public.cities c
where c.slug = 'messina'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università "Kore" di Enna', 'unikore'
from public.cities c
where c.slug = 'enna'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Cagliari', 'unica'
from public.cities c
where c.slug = 'cagliari'
on conflict (city_id, slug) do update set name = excluded.name;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Centro storico', 'centro'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unica'
where c.slug = 'cagliari'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.campuses (city_id, university_id, name, slug)
select c.id, u.id, 'Cittadella Universitaria di Monserrato', 'monserrato'
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'unica'
where c.slug = 'cagliari'
on conflict (city_id, name) do update set
  university_id = excluded.university_id,
  slug = excluded.slug;

insert into public.universities (city_id, name, slug)
select c.id, 'Università di Sassari', 'uniss'
from public.cities c
where c.slug = 'sassari'
on conflict (city_id, slug) do update set name = excluded.name;


-- Link legacy Ancona campuses without slug
update public.campuses camp
set slug = 'monte_dago',
    university_id = u.id
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona' and camp.city_id = c.id and camp.name = 'Monte Dago';

update public.campuses camp
set slug = 'torrette',
    university_id = u.id
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona' and camp.city_id = c.id and camp.name = 'Torrette';

update public.campuses camp
set slug = 'villarey',
    university_id = u.id
from public.cities c
join public.universities u on u.city_id = c.id and u.slug = 'univpm'
where c.slug = 'ancona' and camp.city_id = c.id and camp.name = 'Centro (Economia/Giurisprudenza)';
