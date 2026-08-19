-- ============================================================================
-- MIGRATION: escrow_payments (marketplace trust hold — schema only)
-- Holds first month / deposit until both parties confirm move-in.
-- Stripe charge/transfer NOT wired yet (legal review pending).
-- UI must label this as inactive / not live until ESCROW goes live.
-- Scope: independent marketplace listings only (not guaranteed_rent seed).
-- OPTIONAL: never a gate on property publication / Stripe Connect readiness.
-- ============================================================================

create table if not exists public.escrow_payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.room_applications(id) on delete set null,
  room_id uuid not null references public.rooms(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  status text not null default 'pending'
    check (status in ('pending', 'released', 'disputed', 'refunded')),
  student_confirmed_at timestamptz,
  owner_confirmed_at timestamptz,
  -- Reserved for future Stripe Connect / PaymentIntent wiring (nullable forever until live)
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_escrow_payments_student
  on public.escrow_payments (student_id, created_at desc);

create index if not exists idx_escrow_payments_owner
  on public.escrow_payments (owner_id, created_at desc);

create index if not exists idx_escrow_payments_application
  on public.escrow_payments (application_id)
  where application_id is not null;

create index if not exists idx_escrow_payments_status
  on public.escrow_payments (status);

comment on table public.escrow_payments is
  'Marketplace escrow ledger. No live Stripe until legal OK + ESCROW_LIVE. Statuses: pending|released|disputed|refunded.';

alter table public.escrow_payments enable row level security;

create policy "escrow_select_participant"
  on public.escrow_payments for select
  using (auth.uid() = student_id or auth.uid() = owner_id);

-- Inserts/updates via service role only until live product rules exist
grant select on public.escrow_payments to authenticated;
