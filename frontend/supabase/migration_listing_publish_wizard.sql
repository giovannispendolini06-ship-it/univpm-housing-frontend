-- ============================================================================
-- Publish wizard fields: description, audience, virtual tour, POIs, drafts.
-- latitude/longitude already exist (migration_property_coordinates).
-- ============================================================================

alter table public.properties
  add column if not exists description text,
  add column if not exists virtual_tour_url text,
  add column if not exists target_audience text
    check (
      target_audience is null
      or target_audience in ('studenti', 'lavoratori', 'entrambi')
    ),
  add column if not exists size_sqm numeric
    check (size_sqm is null or size_sqm > 0),
  add column if not exists floor_number integer,
  add column if not exists highlights text,
  add column if not exists nearby_pois jsonb not null default '[]'::jsonb,
  add column if not exists wizard_draft jsonb;

comment on column public.properties.description is
  'Public listing description (owner-edited; may be Vesta-drafted).';
comment on column public.properties.virtual_tour_url is
  'Optional Matterport / 3D tour URL shown on public listing.';
comment on column public.properties.target_audience is
  'studenti | lavoratori | entrambi — drives POI categories and demand preview.';
comment on column public.properties.nearby_pois is
  'Cached Mapbox POIs [{name, category, distanceM, lat, lng}] near the pin.';
comment on column public.properties.wizard_draft is
  'In-progress publish wizard payload (autosave); cleared on publish.';

alter table public.rooms
  add column if not exists description text;

comment on column public.rooms.description is
  'Optional room-level description; property.description is preferred for public cards.';
