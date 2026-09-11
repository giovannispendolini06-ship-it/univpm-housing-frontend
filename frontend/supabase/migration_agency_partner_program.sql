-- ============================================================================
-- Agency partner program (standard / partner / fondatrice)
-- Fields live on public.users for owners/agencies (no separate agencies table).
-- ============================================================================

alter table public.users
  add column if not exists partner_tier text not null default 'standard'
    check (partner_tier in ('standard', 'partner', 'fondatrice')),
  add column if not exists tier_updated_at timestamptz,
  add column if not exists founding_rate boolean not null default false;

comment on column public.users.partner_tier is
  'Agency partner level: standard (default), partner (≥3 closed_leases / 12 mo), fondatrice (admin-only).';
comment on column public.users.tier_updated_at is
  'When partner_tier last changed (auto Partner upgrade or admin Fondatrice).';
comment on column public.users.founding_rate is
  'True for Fondatrice agencies — future success-fee billing uses reduced rate. No fee calc here.';

create index if not exists idx_users_partner_tier
  on public.users (partner_tier)
  where partner_tier <> 'standard';

-- Block clients from self-assigning partner_tier / founding_rate
-- (extends existing privileged-column guard)
create or replace function public.protect_users_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role then
      raise exception 'users.role cannot be changed by clients';
    end if;
    if new.verification_status is distinct from old.verification_status
      or new.verification_method is distinct from old.verification_method
      or new.verified_at is distinct from old.verified_at
      or new.verification_note is distinct from old.verification_note
    then
      raise exception 'users verification fields cannot be changed by clients';
    end if;
    if new.partner_tier is distinct from old.partner_tier
      or new.tier_updated_at is distinct from old.tier_updated_at
      or new.founding_rate is distinct from old.founding_rate
    then
      raise exception 'users partner_tier / founding_rate cannot be changed by clients';
    end if;
  end if;

  return new;
end;
$$;
