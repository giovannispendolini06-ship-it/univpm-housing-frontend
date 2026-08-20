-- Marketplace seed-supply flag: listings procured by Coabito under
-- guaranteed-rent agreements with owners. Distinct from guarantee_status
-- (deposit / surety type). Independent owner listings stay false.

alter table public.properties
  add column if not exists guaranteed_rent boolean not null default false;

comment on column public.properties.guaranteed_rent is
  'True when Coabito procured the listing under a guaranteed-rent (canone garantito) agreement — shown as trust badge on the marketplace.';

create index if not exists idx_properties_guaranteed_rent
  on public.properties (guaranteed_rent)
  where guaranteed_rent = true;
