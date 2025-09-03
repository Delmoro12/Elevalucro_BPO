-- Debug JWT Hook - Teste detalhado da query exata do hook
-- Execute no banco de produção para diagnosticar por que company_id e role estão NULL

-- 1. Primeiro, verificar se o usuário existe
SELECT 'User exists check:' as step;
SELECT 
  id, 
  email, 
  profile_id, 
  role_id,
  created_at
FROM users 
WHERE email = 'lucas@lucasdelmoro.dev';

-- 2. Verificar se o profile existe
SELECT 'Profile exists check:' as step;
SELECT 
  u.id as user_id,
  u.email,
  u.profile_id,
  p.id as profile_table_id,
  p.company_id,
  p.name as profile_name
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
WHERE u.email = 'lucas@lucasdelmoro.dev';

-- 3. Verificar se o role existe
SELECT 'Role exists check:' as step;
SELECT 
  u.id as user_id,
  u.email,
  u.role_id,
  r.id as role_table_id,
  r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'lucas@lucasdelmoro.dev';

-- 4. Teste da query EXATA do JWT hook
SELECT 'JWT Hook exact query:' as step;
SELECT 
  u.id as user_id,
  u.email,
  p.company_id,
  u.profile_id,
  r.name as role_name,
  s.plan_type as subscription_plan,
  s.status as subscription_status
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
WHERE u.email = 'lucas@lucasdelmoro.dev';

-- 5. Verificar se há algum problema com as subscriptions
SELECT 'Subscriptions check:' as step;
SELECT 
  s.*,
  c.name as company_name
FROM users u
JOIN profiles p ON u.profile_id = p.id
JOIN subscriptions s ON p.company_id = s.company_id
LEFT JOIN companies c ON s.company_id = c.id
WHERE u.email = 'lucas@lucasdelmoro.dev';

-- 6. Query alternativa sem a condição de subscription ativa
SELECT 'Query without subscription filter:' as step;
SELECT 
  u.id as user_id,
  u.email,
  p.company_id,
  u.profile_id,
  r.name as role_name,
  s.plan_type as subscription_plan,
  s.status as subscription_status
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN subscriptions s ON p.company_id = s.company_id
WHERE u.email = 'lucas@lucasdelmoro.dev';

-- 7. Verificar todas as tabelas envolvidas
SELECT 'Tables count check:' as step;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions;