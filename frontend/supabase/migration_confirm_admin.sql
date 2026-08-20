-- ============================================================================
-- MIGRATION: conferma il tuo account come admin (OPS ONLY)
-- Assegna admin SOLO tramite questa (o migration_promote_admin), mai via
-- signup / raw_user_meta_data. Contiene un'email reale di bootstrap founder —
-- riesegui solo consapevolmente su progetti autorizzati.
-- ============================================================================

update public.users
set role = 'admin'
where email = 'giovannispendolini06@gmail.com';

-- Verifica: dovrebbe restituire una riga con role = 'admin'
select id, email, role from public.users where email = 'giovannispendolini06@gmail.com';
