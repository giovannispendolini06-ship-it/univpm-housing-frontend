-- ============================================================================
-- MIGRATION: conferma il tuo account come admin
-- ============================================================================

update public.users
set role = 'admin'
where email = 'giovannispendolini06@gmail.com';

-- Verifica: dovrebbe restituire una riga con role = 'admin'
select id, email, role from public.users where email = 'giovannispendolini06@gmail.com';
