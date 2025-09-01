-- =====================================================
-- 🔐 Database Function: Cadastro Completo de Cliente
-- 📂 database/functions/004_create_client_signup.sql
-- 🎯 Cria um novo cliente completo com empresa e assinatura
-- 📆 Atualizado: 2025-01-22
-- 👤 Autor: ElevaLucro Development Team
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_client_signup(
  p_user_id UUID, 
  p_prospect_data JSONB
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
  v_client_role_id UUID;
  v_profile_id UUID;
  v_subscription_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Criar empresa baseada nos dados do prospect
  INSERT INTO companies (
    name,
    slug,
    email,
    phone,
    cnpj,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_prospect_data->>'nome_empresa',
    lower(replace(replace(p_prospect_data->>'nome_empresa', ' ', '-'), '.', '')),
    p_prospect_data->>'email_contato',
    p_prospect_data->>'telefone_contato',
    p_prospect_data->>'cnpj',
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_company_id;

  -- 2. Buscar role_id para 'client_side'
  SELECT id INTO v_client_role_id
  FROM roles
  WHERE name = 'client_side'
  LIMIT 1;

  IF v_client_role_id IS NULL THEN
    RAISE EXCEPTION 'Role "client_side" não encontrada na tabela roles.';
  END IF;

  -- 3. Criar profile padrão para o cliente
  INSERT INTO profiles (
    name,
    role_id,
    company_id,
    is_active,
    created_at
  ) VALUES (
    'Administrador',
    v_client_role_id,
    v_company_id,
    true,
    NOW()
  ) RETURNING id INTO v_profile_id;

  -- 4. Criar usuário na tabela users
  INSERT INTO users (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    whatsapp,
    role_id,
    profile_id,
    is_active,
    is_verified,
    verification_level,
    terms_accepted_at,
    privacy_policy_accepted_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_prospect_data->>'email_contato',
    p_prospect_data->>'nome_contato',
    split_part(p_prospect_data->>'nome_contato', ' ', 1),
    trim(replace(p_prospect_data->>'nome_contato', split_part(p_prospect_data->>'nome_contato', ' ', 1), '')),
    p_prospect_data->>'telefone_contato',
    p_prospect_data->>'telefone_contato',
    v_client_role_id,
    v_profile_id,
    true,
    true,
    'email',
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );

  -- 5. Criar assinatura baseada no plano selecionado
  INSERT INTO subscriptions (
    company_id,
    plan_type,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_company_id,
    p_prospect_data->>'plano',
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO v_subscription_id;

  -- 6. Buscar entidades existentes para criar permissões padrão
  -- Criar permissões básicas para o profile (pode ser expandido depois)
  INSERT INTO permissions (profile_id, entity_id, can_read, can_create, can_update, can_delete)
  SELECT 
    v_profile_id,
    e.id,
    true,  -- can_read
    true,  -- can_create
    true,  -- can_update
    false  -- can_delete (permissão mais restritiva por padrão)
  FROM entities e
  WHERE e.name IN ('companies', 'users', 'prospects', 'subscriptions');

  -- 7. Vincular usuário ao profile
  INSERT INTO user_profiles (
    user_id,
    profile_id,
    is_active,
    created_at
  ) VALUES (
    p_user_id,
    v_profile_id,
    true,
    NOW()
  );

  -- 8. Configurar checklist de onboarding para a nova empresa
  PERFORM setup_company_onboarding_checklist(v_company_id, p_prospect_data->>'plano');

  -- 9. Configurar rotinas baseadas no plano de assinatura
  PERFORM setup_company_routines(v_company_id, p_prospect_data->>'plano');

  -- Preparar resultado
  v_result := jsonb_build_object(
    'success', true,
    'company_id', v_company_id,
    'user_id', p_user_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'plan', p_prospect_data->>'plano',
    'company_name', p_prospect_data->>'nome_empresa'
  );

  -- Log para debug
  RAISE LOG 'Client signup completed - User: %, Company: %, Profile: %, Subscription: %', 
    p_user_id, v_company_id, v_profile_id, v_subscription_id;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, garantir que a transação seja revertida
  RAISE EXCEPTION 'Erro durante criação do cliente: %', SQLERRM;
END;
$$;

-- Comentários sobre a função
COMMENT ON FUNCTION public.create_client_signup(UUID, JSONB) IS 
'Cria um novo cliente completo com empresa, usuário, profile e assinatura.
Parâmetros:
- p_user_id: ID do usuário (vem do Supabase Auth)
- p_prospect_data: Dados completos do prospect em formato JSONB
Retorna: JSONB com IDs criados e status

Fluxo:
1. Cria companies com dados do prospect
2. Busca role_id para client_side
3. Cria profiles (Administrador)
4. Cria users com role_id e profile_id
5. Cria subscriptions baseado no plano
6. Cria permissions básicas para o profile
7. Vincula user_profiles
8. Retorna resultado em JSONB';

-- Garante permissões corretas
GRANT EXECUTE ON FUNCTION public.create_client_signup TO service_role;
GRANT EXECUTE ON FUNCTION public.create_client_signup TO postgres;