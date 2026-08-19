-- ============================================================================
-- Configurable what marketplace escrow may hold (no live charges yet).
-- Does NOT choose a production policy — stores the option for later.
-- Values:
--   first_month              → only first month rent
--   deposit                  → only security deposit
--   first_month_and_deposit  → both (sum)
-- ============================================================================

alter table public.properties
  add column if not exists escrow_coverage text
    check (
      escrow_coverage is null
      or escrow_coverage in (
        'first_month',
        'deposit',
        'first_month_and_deposit'
      )
    );

comment on column public.properties.escrow_coverage is
  'Marketplace escrow scope when ESCROW_LIVE: first_month | deposit | first_month_and_deposit. Null = use platform default.';

-- Snapshot on each escrow row (immutable once created in future live flow)
alter table public.escrow_payments
  add column if not exists coverage text
    check (
      coverage is null
      or coverage in (
        'first_month',
        'deposit',
        'first_month_and_deposit'
      )
    );

alter table public.escrow_payments
  add column if not exists first_month_cents integer,
  add column if not exists deposit_cents integer;

comment on column public.escrow_payments.coverage is
  'What this escrow hold includes (snapshot of property/platform setting at creation).';
comment on column public.escrow_payments.first_month_cents is
  'Illustrative/actual first-month component in cents (nullable if coverage=deposit only).';
comment on column public.escrow_payments.deposit_cents is
  'Illustrative/actual deposit component in cents (nullable if coverage=first_month only).';
