-- Debug JWT Hook - Verificar estrutura e dados
-- Execute essas queries no banco de produção para diagnosticar o problema

-- 1. Verificar estrutura da tabela subscriptions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('plan_type', 'subscription_plan')
ORDER BY column_name;

-- 2. Verificar dados na tabela subscriptions para a empresa do usuário
SELECT s.*, c.name as company_name
FROM subscriptions s
JOIN companies c ON s.company_id = c.id  
WHERE s.company_id = 'ab4697b9-7952-4fb9-ada9-e641ff43ce01';

-- 3. Testar a query exata do JWT hook para o usuário específico
SELECT 
  u.id as user_id,
  u.email,
  p.company_id,
  u.profile_id,
  r.name as role_name,
  s.plan_type as subscription_plan_via_plan_type,
  s.subscription_plan as subscription_plan_via_subscription_plan,
  s.status as subscription_status
FROM users u
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
WHERE u.id = '9f780dd4-7b2c-42fb-a57c-320cfb2ddd79';

-- 4. Verificar se existem múltiplas subscriptions ativas para a empresa
SELECT company_id, status, COUNT(*)
FROM subscriptions 
WHERE company_id = 'ab4697b9-7952-4fb9-ada9-e641ff43ce01'
GROUP BY company_id, status;