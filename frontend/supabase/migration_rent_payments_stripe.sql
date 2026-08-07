-- ============================================================================
-- MIGRATION: rent_payments — campi Stripe (pronta per checkout + webhook)
-- Stati esistenti restano in italiano (usati da admin UI ed email):
--   da_registrare ≈ pending, pagato ≈ paid, in_ritardo ≈ overdue
-- Aggiunto: fallito ≈ failed (es. payment_intent.payment_failed)
-- ============================================================================

-- Rimuove il check constraint precedente e lo ricrea con 'fallito'
alter table public.rent_payments
  drop constraint if exists rent_payments_status_check;

alter table public.rent_payments
  add constraint rent_payments_status_check
  check (status in ('da_registrare', 'pagato', 'in_ritardo', 'fallito'));

alter table public.rent_payments
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_invoice_url text,
  add column if not exists payment_method text;

create index if not exists idx_rent_payments_stripe_pi
  on public.rent_payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists idx_rent_payments_stripe_customer
  on public.rent_payments (stripe_customer_id)
  where stripe_customer_id is not null;
