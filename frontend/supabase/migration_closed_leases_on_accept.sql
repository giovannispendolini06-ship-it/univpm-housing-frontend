-- ============================================================================
-- Accept application → auto tenancy + closed_leases (billing precursor)
-- Extends existing room_applications / room_tenancies (no parallel tables).
-- ============================================================================

-- When the owner decides on an application
alter table public.room_applications
  add column if not exists decided_at timestamptz;

comment on column public.room_applications.decided_at is
  'Set when status becomes accepted or rejected.';

-- Closed lease events for future success-fee billing (no fee calc here)
create table if not exists public.closed_leases (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.room_tenancies (id) on delete restrict,
  room_id uuid not null references public.rooms (id) on delete restrict,
  application_id uuid references public.room_applications (id) on delete set null,
  owner_id uuid not null references public.users (id) on delete restrict,
  monthly_rent numeric(10, 2) not null check (monthly_rent >= 0),
  closed_at timestamptz not null default now()
);

create index if not exists idx_closed_leases_owner_closed
  on public.closed_leases (owner_id, closed_at desc);

create index if not exists idx_closed_leases_tenancy
  on public.closed_leases (tenancy_id);

create unique index if not exists closed_leases_application_uidx
  on public.closed_leases (application_id)
  where application_id is not null;

alter table public.closed_leases enable row level security;

-- Owners see their own closed leases; seekers see none (billing/ops only via service role)
drop policy if exists "closed_leases_select_owner" on public.closed_leases;
create policy "closed_leases_select_owner" on public.closed_leases
  for select to authenticated
  using (owner_id = auth.uid());

-- No insert/update/delete for authenticated — service role only (accept action)
grant select on public.closed_leases to authenticated;
grant all on public.closed_leases to service_role;

-- Allow owners to update property status (pause / reactivate) — if missing
-- (properties already have owner RLS in core migrations; this is additive)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'properties_update_own'
  ) then
    create policy "properties_update_own" on public.properties
      for update to authenticated
      using (owner_id = auth.uid())
      with check (owner_id = auth.uid());
  end if;
end $$;

comment on table public.closed_leases is
  'Lease closed event when an application is accepted. Feeds future success-fee billing; no fee stored here.';
