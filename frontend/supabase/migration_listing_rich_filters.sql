-- Campi opzionali per i filtri ricchi su /stanze.
-- Null = dato non ancora raccolto; i filtri escludono i null quando attivi.

-- Tipo stanza esplicito (singola / doppia / doppia uso singola)
alter table public.rooms
  add column if not exists room_type text
  check (room_type is null or room_type in ('singola', 'doppia', 'dus'));

-- Riscaldamento a livello immobile (complementa services_included)
alter table public.properties
  add column if not exists heating_type text
  check (heating_type is null or heating_type in ('autonomo', 'centralizzato'));

-- Durata minima contratto in mesi
alter table public.properties
  add column if not exists min_contract_months integer
  check (min_contract_months is null or min_contract_months > 0);

-- Regole della casa
alter table public.properties
  add column if not exists pets_allowed boolean;

alter table public.properties
  add column if not exists smoking_allowed boolean;

comment on column public.rooms.room_type is
  'singola | doppia | dus — usato dai filtri /stanze';
comment on column public.properties.heating_type is
  'autonomo | centralizzato — usato dai filtri /stanze';
comment on column public.properties.min_contract_months is
  'Durata minima contratto in mesi (es. 6, 12)';
comment on column public.properties.pets_allowed is
  'Animali ammessi in casa';
comment on column public.properties.smoking_allowed is
  'Fumatori ammessi in casa';
