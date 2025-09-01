-- ======================================
-- RESET COMPLETO DO BANCO DE DADOS
-- ======================================
-- Remove todos os dados para teste limpo

-- 1. Delete all onboarding data
DELETE FROM companies_onboarding_checklist;
DELETE FROM routine_executions;
DELETE FROM companies_routines;

-- 2. Delete all user related data
DELETE FROM user_profiles;
DELETE FROM permissions;
DELETE FROM users;
DELETE FROM profiles;

-- 3. Delete all company data
DELETE FROM subscriptions;
DELETE FROM companies;

-- 4. Delete all prospects
DELETE FROM prospects;

-- 5. Reset sequences (if any)
-- Note: UUIDs don't need sequence reset

-- Display counts after deletion
SELECT 'prospects' as table_name, COUNT(*) as count FROM prospects
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL  
SELECT 'companies_onboarding_checklist', COUNT(*) FROM companies_onboarding_checklist
UNION ALL
SELECT 'companies_routines', COUNT(*) FROM companies_routines
ORDER BY table_name;

-- Show remaining onboarding_checklist template data (should remain)
SELECT 'onboarding_checklist_templates' as info, COUNT(*) as count FROM onboarding_checklist;