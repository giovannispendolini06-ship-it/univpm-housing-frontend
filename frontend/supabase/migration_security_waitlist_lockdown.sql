-- ============================================================================
-- SECURITY CORRECTIVE: waitlist — remove anon/authenticated INSERT
-- Prevents PostgREST clients from setting confirmed_at / confirmation_token /
-- contattato / note and bypassing double opt-in.
-- App path: app/lista-attesa/actions.ts + lib/waitlist.ts (service role).
-- ============================================================================

alter table public.waitlist_signups enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist_signups;
drop policy if exists "waitlist_signups_insert_anon" on public.waitlist_signups;
drop policy if exists "waitlist_signups_insert_public" on public.waitlist_signups;
drop policy if exists "Enable insert for everyone" on public.waitlist_signups;

-- No policies for anon/authenticated ⇒ deny all JWT roles.
-- Service role bypasses RLS (server actions / admin panel).

comment on table public.waitlist_signups is
  'Waitlist leads. Client has no RLS access; inserts/updates only via service role.';
