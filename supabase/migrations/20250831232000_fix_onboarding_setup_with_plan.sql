-- ======================================
-- Migration: Fix Onboarding Setup to Use Correct Plan
-- ======================================
-- Fix the create_client_signup procedure to pass the subscription plan
-- when calling setup_company_onboarding_checklist

-- Update the create_client_signup procedure to include plan parameter
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
  v_onboarding_result JSONB;
  v_routines_result JSONB;
  v_result JSONB;
BEGIN
  -- Log inicial
  RAISE LOG '🚀 Starting client signup for user: % with data: %', p_user_id, p_prospect_data;

  -- 1. Criar empresa baseada nos dados do prospect (COM TODOS OS CAMPOS)
  INSERT INTO companies (
    name,
    slug,
    email,
    phone,
    cnpj,
    segmento,
    subscription_plan,  -- Vem do prospect, não default!
    is_active,
    lifecycle_stage,
    onboarding_progress,
    created_at,
    updated_at
  ) VALUES (
    p_prospect_data->>'nome_empresa',
    lower(replace(replace(p_prospect_data->>'nome_empresa', ' ', '-'), '.', '')),
    p_prospect_data->>'email_contato',
    p_prospect_data->>'telefone_contato',
    p_prospect_data->>'cnpj',
    p_prospect_data->>'segmento',  -- Novo campo
    p_prospect_data->>'plano',     -- Vem do prospect!
    true,
    'onboarding',
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO v_company_id;

  RAISE LOG '✅ Company created with ID: % (plan: %, segmento: %)', 
    v_company_id, p_prospect_data->>'plano', p_prospect_data->>'segmento';

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

  RAISE LOG '✅ Profile created with ID: %', v_profile_id;

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

  RAISE LOG '✅ User created with ID: %', p_user_id;

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

  RAISE LOG '✅ Subscription created with ID: % for plan: %', v_subscription_id, p_prospect_data->>'plano';

  -- 6. Criar permissões básicas para o profile
  INSERT INTO permissions (profile_id, entity_id, can_read, can_create, can_update, can_delete)
  SELECT 
    v_profile_id,
    e.id,
    true,  -- can_read
    true,  -- can_create
    true,  -- can_update
    false  -- can_delete
  FROM entities e
  WHERE e.name IN ('companies', 'users', 'prospects', 'subscriptions');

  RAISE LOG '✅ Permissions created for profile';

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

  RAISE LOG '✅ User linked to profile';

  -- 8. CRITICAL: Setup onboarding checklist - WITH CORRECT PLAN PARAMETER
  RAISE LOG '📋 Setting up onboarding checklist for company: % with plan: %', v_company_id, p_prospect_data->>'plano';
  
  -- FIXED: Now passing the subscription plan parameter
  SELECT setup_company_onboarding_checklist(v_company_id, p_prospect_data->>'plano') INTO v_onboarding_result;
  
  IF v_onboarding_result IS NULL OR (v_onboarding_result->>'success')::boolean = false THEN
    RAISE EXCEPTION 'Failed to setup onboarding checklist: %', 
      COALESCE(v_onboarding_result->>'error', 'Unknown error');
  END IF;
  
  RAISE LOG '✅ Onboarding checklist created: % items', v_onboarding_result->>'items_created';

  -- 9. CRITICAL: Setup company routines - WITH ERROR HANDLING
  RAISE LOG '🔄 Setting up routines for company: % with plan: %', v_company_id, p_prospect_data->>'plano';
  
  SELECT setup_company_routines(v_company_id, p_prospect_data->>'plano') INTO v_routines_result;
  
  IF v_routines_result IS NULL OR (v_routines_result->>'success')::boolean = false THEN
    RAISE EXCEPTION 'Failed to setup company routines: %', 
      COALESCE(v_routines_result->>'error', 'Unknown error');
  END IF;
  
  RAISE LOG '✅ Company routines created: % routines', v_routines_result->>'routines_created';

  -- Preparar resultado completo
  v_result := jsonb_build_object(
    'success', true,
    'company_id', v_company_id,
    'user_id', p_user_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'plan', p_prospect_data->>'plano',
    'company_name', p_prospect_data->>'nome_empresa',
    'segmento', p_prospect_data->>'segmento',
    'onboarding_items', v_onboarding_result->>'items_created',
    'routines_created', v_routines_result->>'routines_created'
  );

  -- Log final de sucesso
  RAISE LOG '🎉 Client signup COMPLETED successfully - Company: % (%), Plan: %, Onboarding: % items, Routines: % items', 
    v_company_id, 
    p_prospect_data->>'nome_empresa',
    p_prospect_data->>'plano',
    v_onboarding_result->>'items_created',
    v_routines_result->>'routines_created';

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log do erro completo
  RAISE LOG '❌ ERROR in create_client_signup: % - SQLSTATE: %', SQLERRM, SQLSTATE;
  
  -- Em caso de erro, garantir que a transação seja revertida
  RAISE EXCEPTION 'Erro durante criação do cliente: %', SQLERRM;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_client_signup TO service_role;
GRANT EXECUTE ON FUNCTION public.create_client_signup TO postgres;

-- Comment with the fix
COMMENT ON FUNCTION public.create_client_signup(UUID, JSONB) IS 
'Fixed version: Now correctly passes subscription_plan to setup_company_onboarding_checklist.
This ensures the correct number of checklist items are created for each plan:
- controle: 16 items
- gerencial: 18 items  
- avancado: 20 items
Including plan-specific items like "Primeira reunião de consultoria" for avancado plan.';