-- ============================================================================
-- MIGRATION: contatti del proprietario reale su properties
-- Nel tuo modello di business, spesso inserisci un immobile PRIMA che il
-- proprietario abbia un suo account sul sito (owner_id resta il tuo account
-- admin, che gestisce l'immobile per suo conto). Questi campi servono per
-- non perdere i suoi contatti nel frattempo.
-- ============================================================================

alter table public.properties
  add column if not exists owner_contact_name text,
  add column if not exists owner_contact_phone text,
  add column if not exists owner_contact_email text;
