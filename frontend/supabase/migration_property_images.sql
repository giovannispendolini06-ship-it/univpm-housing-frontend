-- ============================================================================
-- MIGRATION: foto degli immobili
-- Aggiunge la tabella property_images e il bucket Storage "property-photos"
-- dove salvare i file veri e propri.
-- ============================================================================

create table public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_property_images_property_id on public.property_images (property_id);

alter table public.property_images enable row level security;

-- Lettura pubblica: le foto le devono vedere anche gli studenti sulle schede
create policy "property_images_select_public" on public.property_images
  for select using (true);

-- Scrittura riservata all'admin (le server action usano comunque la service
-- role, ma questa policy resta come ulteriore livello di sicurezza)
create policy "property_images_admin_write" on public.property_images
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- --- Bucket Storage per i file immagine ------------------------------------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "property_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "property_photos_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'property-photos'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "property_photos_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'property-photos'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
