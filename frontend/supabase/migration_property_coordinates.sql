-- Optional map coordinates for properties (marketplace Mapbox pins).
-- When null, the app falls back to zone centroids (approximate, privacy-safe).

alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.properties.latitude is
  'Optional WGS84 latitude for map pin. Prefer zone centroid if null (privacy).';
comment on column public.properties.longitude is
  'Optional WGS84 longitude for map pin. Prefer zone centroid if null (privacy).';
