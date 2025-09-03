-- Debug JWT Hook para usuário específico: lucas_delmoro@hotmail.com
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar dados do usuário na auth.users
SELECT 
  'auth.users' as table_name,
  id, email, 
  created_at
FROM auth.users 
WHERE email = 'lucas_delmoro@hotmail.com';

-- 2. Verificar dados do usuário na public.users
SELECT 
  'public.users' as table_name,
  u.id, 
  u.email, 
  u.full_name,
  u.role_id,
  u.profile_id,
  r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'lucas_delmoro@hotmail.com';

-- 3. Verificar profile e company
SELECT 
  'profile_and_company' as table_name,
  u.id as user_id,
  u.email,
  u.profile_id,
  p.id as profile_table_id,
  p.name as profile_name,
  p.company_id,
  c.name as company_name,
  c.slug as company_slug
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN companies c ON p.company_id = c.id
WHERE u.email = 'lucas_delmoro@hotmail.com';

-- 4. Testar a QUERY EXATA do JWT Hook
SELECT 
  'jwt_hook_query' as table_name,
  u.id as user_id,
  p.company_id,
  u.profile_id,
  r.name as role_name,
  s.plan_type as subscription_plan,
  s.status as subscription_status
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
WHERE u.email = 'lucas_delmoro@hotmail.com';

-- 5. Verificar subscriptions da empresa
SELECT 
  'subscriptions' as table_name,
  s.*,
  c.name as company_name
FROM users u
JOIN profiles p ON u.profile_id = p.id
JOIN subscriptions s ON p.company_id = s.company_id
JOIN companies c ON s.company_id = c.id
WHERE u.email = 'lucas_delmoro@hotmail.com';

-- 6. Verificar se há múltiplas subscriptions
SELECT 
  'subscription_count' as table_name,
  p.company_id,
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE s.status = 'active') as active_subscriptions
FROM users u
JOIN profiles p ON u.profile_id = p.id
LEFT JOIN subscriptions s ON p.company_id = s.company_id
WHERE u.email = 'lucas_delmoro@hotmail.com'
GROUP BY p.company_id;