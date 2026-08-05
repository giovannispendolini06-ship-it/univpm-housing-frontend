-- ============================================================================
-- MIGRATION: move_checklist su room_tenancies
-- Checklist di trasloco generata una volta alla registrazione dell'affitto
-- e mostrata nello studente in "La mia casa".
-- ============================================================================

alter table public.room_tenancies
  add column if not exists move_checklist jsonb;
