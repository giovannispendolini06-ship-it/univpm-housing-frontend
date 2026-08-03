-- ============================================================================
-- MIGRATION: promuovi il tuo account a 'admin'
-- Necessaria per poter accedere a /admin/leads. Sostituisci l'email con
-- quella che usi per accedere a Domoria (quella con cui ti sei registrato).
-- ============================================================================

update public.users
set role = 'admin'
where email = 'INSERISCI_QUI_LA_TUA_EMAIL@esempio.it';

-- Verifica: dovrebbe restituire una riga con role = 'admin'
select id, email, role from public.users where role = 'admin';
