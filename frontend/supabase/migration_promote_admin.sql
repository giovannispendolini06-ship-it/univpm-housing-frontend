-- ============================================================================
-- MIGRATION: promuovi un account a 'admin' (OPS ONLY)
-- Unica via supportata per ottenere role=admin. NON usare Auth metadata.
-- Sostituisci l'email. Non eseguire in automatico su deploy.
-- ============================================================================

update public.users
set role = 'admin'
where email = 'INSERISCI_QUI_LA_TUA_EMAIL@esempio.it';

-- Verifica: dovrebbe restituire una riga con role = 'admin'
select id, email, role from public.users where role = 'admin';
