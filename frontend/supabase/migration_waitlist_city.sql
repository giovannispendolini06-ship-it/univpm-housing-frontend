-- ============================================================================
-- MIGRATION: waitlist city segmentation
-- Stores city_slug from Vesta /lista-attesa?city=… for coming-soon cities.
-- ============================================================================

alter table public.waitlist_signups
  add column if not exists city_slug text;

create index if not exists idx_waitlist_signups_city_slug
  on public.waitlist_signups (city_slug);
