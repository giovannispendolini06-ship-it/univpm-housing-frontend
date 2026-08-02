-- Dado: stanze e tenancy (affitti / coinquilini)
-- Eseguire su Supabase SQL editor o via CLI.

create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  city text not null,
  neighborhood text not null,
  rent_monthly integer not null check (rent_monthly > 0),
  available_from date not null,
  beds integer not null default 1 check (beds > 0),
  amenities text[] not null default '{}',
  image_url text,
  lifestyle_tags text[] not null default '{}',
  cleanliness smallint not null default 3 check (cleanliness between 1 and 5),
  noise_level smallint not null default 3 check (noise_level between 1 and 5),
  pets_allowed boolean not null default false,
  smoking_allowed boolean not null default false,
  description text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_tenancies (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  role text not null check (role in ('seeker', 'tenant', 'landlord')),
  status text not null default 'interested'
    check (status in ('interested', 'applied', 'accepted', 'rejected', 'active', 'ended')),
  move_in_date date,
  move_out_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_city_idx on public.rooms (city);
create index if not exists rooms_available_idx on public.rooms (is_available, available_from);
create index if not exists room_tenancies_room_idx on public.room_tenancies (room_id);
create index if not exists room_tenancies_user_idx on public.room_tenancies (user_id);

alter table public.rooms enable row level security;
alter table public.room_tenancies enable row level security;

-- Lettura pubblica delle stanze disponibili
create policy "rooms_select_available"
  on public.rooms
  for select
  using (is_available = true);

-- I tenancy sono visibili solo al proprietario della riga (o via service role)
create policy "tenancies_select_own"
  on public.room_tenancies
  for select
  using (auth.uid() = user_id);

create policy "tenancies_insert_own"
  on public.room_tenancies
  for insert
  with check (auth.uid() = user_id);

create policy "tenancies_update_own"
  on public.room_tenancies
  for update
  using (auth.uid() = user_id);
