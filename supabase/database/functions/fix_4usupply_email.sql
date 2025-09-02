-- Script para corrigir o email do usuário comercial@4usupplyfoods.com
-- Execute este script no SQL Editor do Supabase em produção

-- 1. PRIMEIRO: Verificar o que existe com esse email
SELECT 
  'auth.users' as tabela,
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'comercial@4usupplyfoods.com';

-- Verificar em outras tabelas
SELECT 'public.users' as tabela, id, email, created_at FROM public.users WHERE email = 'comercial@4usupplyfoods.com';
SELECT 'public.profiles' as tabela, user_id, email, full_name FROM public.profiles WHERE email = 'comercial@4usupplyfoods.com';

-- 2. ATUALIZAR O EMAIL (ajuste o novo email conforme necessário)
-- Descomente e ajuste o novo email antes de executar:

/*
-- Opção A: Apenas atualizar o email para um novo
DO $$
DECLARE
  v_user_id UUID;
  v_old_email TEXT := 'comercial@4usupplyfoods.com';
  v_new_email TEXT := 'COLOQUE_O_NOVO_EMAIL_AQUI@exemplo.com'; -- <-- AJUSTE AQUI
BEGIN
  -- Buscar o ID do usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_old_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado';
    RETURN;
  END IF;
  
  -- Atualizar em auth.users
  UPDATE auth.users 
  SET email = v_new_email
  WHERE id = v_user_id;
  
  -- Atualizar em public.users
  UPDATE public.users 
  SET email = v_new_email
  WHERE id = v_user_id;
  
  -- Atualizar em public.profiles
  UPDATE public.profiles 
  SET email = v_new_email
  WHERE user_id = v_user_id;
  
  RAISE NOTICE 'Email atualizado de % para %', v_old_email, v_new_email;
END $$;
*/

-- 3. OU DELETAR COMPLETAMENTE O USUÁRIO E REGISTROS RELACIONADOS
-- CUIDADO: Isso é PERMANENTE!
-- Descomente apenas se quiser deletar tudo:

/*
-- Opção B: Deletar o usuário e todos os registros relacionados
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'comercial@4usupplyfoods.com';
BEGIN
  -- Buscar o ID do usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado';
    RETURN;
  END IF;
  
  -- Deletar de company_users
  DELETE FROM public.company_users WHERE user_id = v_user_id;
  RAISE NOTICE 'Deletado de company_users';
  
  -- Deletar de profiles
  DELETE FROM public.profiles WHERE user_id = v_user_id;
  RAISE NOTICE 'Deletado de profiles';
  
  -- Deletar de users
  DELETE FROM public.users WHERE id = v_user_id;
  RAISE NOTICE 'Deletado de users';
  
  -- Deletar de auth.users (isso remove a autenticação)
  DELETE FROM auth.users WHERE id = v_user_id;
  RAISE NOTICE 'Usuário % deletado completamente', v_email;
  
END $$;
*/

-- 4. VERIFICAR RESULTADO
-- Execute novamente a query de verificação do passo 1 para confirmar as mudanças