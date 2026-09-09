-- ============================================================================
-- SAVED LISTINGS (preferiti) + public-safe listings view
-- Marketplace browse stays public via Next.js service role; this migration:
--   1) creates saved_listings with strict auth RLS (no anon writes)
--   2) exposes a public_listings view with only safe columns for anon SELECT
-- ============================================================================

-- ---------------------------------------------------------------------------
-- saved_listings
-- ---------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id    uuid not null references auth.users (id) on delete cascade,
  room_id    uuid not null references public.rooms (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

create index if not exists idx_saved_listings_user_id
  on public.saved_listings (user_id);

create index if not exists idx_saved_listings_room_id
  on public.saved_listings (room_id);

alter table public.saved_listings enable row level security;

drop policy if exists "saved_listings_select_own" on public.saved_listings;
create policy "saved_listings_select_own" on public.saved_listings
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_listings_insert_own" on public.saved_listings;
create policy "saved_listings_insert_own" on public.saved_listings
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_listings_delete_own" on public.saved_listings;
create policy "saved_listings_delete_own" on public.saved_listings
  for delete to authenticated
  using (user_id = auth.uid());

-- Explicit: no anon policies → anon INSERT/DELETE/SELECT denied by RLS
revoke all on public.saved_listings from anon;
grant select, insert, delete on public.saved_listings to authenticated;
grant all on public.saved_listings to service_role;

-- ---------------------------------------------------------------------------
-- public_listings view — marketplace-safe columns only (no owner contact,
-- no street address, no owner_contact_*, no monthly_rent_to_owner / escrow).
-- Core columns only so this runs even before rich-filter migrations.
-- Browse in the Next.js app still uses the service role; this view is the
-- PostgREST-safe surface for anon clients / future direct API use.
-- ---------------------------------------------------------------------------
create or replace view public.public_listings
with (security_invoker = false)
as
select
  r.id as room_id,
  r.room_label as title,
  r.price_monthly as monthly_rent,
  r.estimated_utilities as utilities_estimate,
  r.has_private_bathroom as private_bathroom,
  r.has_balcony as has_balcony,
  r.size_sqm,
  r.max_occupants,
  r.services_included as amenities,
  r.available_from,
  p.id as property_id,
  p.zone as neighbourhood,
  p.city as city_label,
  p.contract_type,
  p.deposit_amount as deposit,
  p.is_furnished as furnished,
  p.guaranteed_rent,
  p.has_elevator,
  p.total_rooms,
  p.latitude,
  p.longitude
from public.rooms r
join public.properties p on p.id = r.property_id
where r.is_available = true
  and p.status = 'attivo';

comment on view public.public_listings is
  'Public marketplace projection — no owner PII, no street address, no internal fields.';

grant select on public.public_listings to anon, authenticated;
grant all on public.public_listings to service_role;

-- Ensure base tables stay closed to anon SELECT (address / owner economics).
-- public_listings is the only anon-readable listing surface.
revoke select on public.rooms from anon;
revoke select on public.properties from anon;
