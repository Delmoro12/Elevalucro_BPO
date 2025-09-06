-- Teste para verificar se o JWT hook está funcionando para usuários BPO
-- Execute este script no banco de produção para debug

-- 1. Verificar se existem usuários BPO (sem profile_id)
SELECT 
  u.id,
  u.email,
  u.profile_id,
  u.role_id,
  r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.profile_id IS NULL
LIMIT 5;

-- 2. Testar o JWT hook com um usuário BPO específico
-- Substitua o UUID abaixo por um ID de usuário BPO real
DO $$
DECLARE
  v_event jsonb;
  v_result jsonb;
  v_user_id uuid := 'SUBSTITUA_AQUI_PELO_ID_DO_USUARIO_BPO';
BEGIN
  -- Simular o evento que o Supabase envia
  v_event := jsonb_build_object(
    'user_id', v_user_id::text,
    'claims', jsonb_build_object(
      'user_metadata', jsonb_build_object()
    )
  );
  
  -- Chamar a função do hook
  v_result := public.custom_access_token_hook(v_event);
  
  -- Mostrar o resultado
  RAISE WARNING 'Input event: %', v_event;
  RAISE WARNING 'Output result: %', v_result;
  RAISE WARNING 'User metadata in result: %', v_result->'claims'->'user_metadata';
END $$;

-- 3. Verificar a estrutura da tabela users
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar quantos usuários têm role_id definido
SELECT 
  COUNT(*) as total_users,
  COUNT(role_id) as users_with_role,
  COUNT(profile_id) as users_with_profile
FROM users;

-- 5. Verificar os roles disponíveis
SELECT * FROM roles;