-- ============================================================================
-- MIGRATION: rent_payments
-- Traccia lo stato mensile degli incassi per ogni affitto attivo (room_tenancy).
-- Usata dalla pagina admin Pagamenti e per il conteggio ritardi in dashboard.
-- ============================================================================

create table public.rent_payments (
  id            uuid primary key default gen_random_uuid(),
  tenancy_id    uuid not null references public.room_tenancies(id) on delete cascade,
  period_month  date not null,
  amount_due    numeric(10, 2) not null default 0,
  status        text not null default 'da_registrare'
    check (status in ('da_registrare', 'pagato', 'in_ritardo')),
  paid_at       date,
  created_at    timestamptz not null default now(),

  unique (tenancy_id, period_month)
);

create index idx_rent_payments_tenancy on public.rent_payments (tenancy_id);
create index idx_rent_payments_period on public.rent_payments (period_month);
create index idx_rent_payments_status on public.rent_payments (status);

alter table public.rent_payments enable row level security;

-- Solo admin via service role; nessuna policy per utenti normali
create policy "rent_payments_admin_only" on public.rent_payments
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
