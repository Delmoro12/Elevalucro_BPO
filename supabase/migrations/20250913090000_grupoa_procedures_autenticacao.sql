-- =============================================================================
-- Migration: GRUPO A - Procedures de Autenticação
-- Generated at: 2025-09-13 09:00:00
-- =============================================================================
-- Procedures relacionadas à autenticação e cadastro de usuários:
-- 1. JWT Access Token Hook
-- 2. Create Client Signup
-- 3. Create BPO Operator Signup

BEGIN;

-- =====================================================
-- 1. JWT ACCESS TOKEN HOOK
-- =====================================================
-- Hook executado pelo Supabase Auth para adicionar claims customizados ao JWT

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  AS $$
  DECLARE
    v_user_id uuid;
    v_existing_metadata jsonb;
    v_claims jsonb;
    v_company_id text;
    v_profile_id text;
    v_role text;
    v_plan text;
    v_status text;
  BEGIN
    v_user_id := (event->>'user_id')::uuid;

    IF v_user_id IS NULL THEN
      RETURN event;
    END IF;

    -- Get existing claims
    v_claims := COALESCE(event->'claims', '{}'::jsonb);
    v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

    -- Set search path to ensure we're looking in the right schema
    PERFORM set_config('search_path', 'public', true);

    -- Get user data - BPO users may not have profile/company
    -- Using LEFT JOINs to handle both BPO and client users
    BEGIN
      SELECT
        u.company_id::text,
        u.profile_id::text,
        r.name,
        COALESCE(s.plan_type, 'controle'),
        COALESCE(s.status, 'active')
      INTO v_company_id, v_profile_id, v_role, v_plan, v_status
      FROM public.users u
      LEFT JOIN public.roles r ON u.role_id = r.id
      LEFT JOIN public.subscriptions s ON u.company_id = s.company_id
        AND s.status = 'active'
      WHERE u.id = v_user_id
      LIMIT 1;

      -- Add the retrieved data only if not null
      IF v_company_id IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('company_id', v_company_id);
      END IF;
      
      IF v_profile_id IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id);
      END IF;
      
      IF v_role IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('role', v_role);
      END IF;
      
      IF v_plan IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object(
          'subscription_plan', v_plan,
          'subscription_status', v_status
        );
      END IF;

    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        -- User not found - this is normal for new users
        NULL;
      WHEN OTHERS THEN
        -- Any other error - continue without adding claims
        NULL;
    END;

    -- Add hook execution metadata
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'jwt_hook_executed', true,
      'jwt_hook_version', '3.1.0-bpo-compatible',
      'processed_at', NOW()::text
    );

    -- Update claims with metadata
    v_claims := v_claims || jsonb_build_object('user_metadata',
  v_existing_metadata);

    -- Update event with new claims
    event := event || jsonb_build_object('claims', v_claims);

    RETURN event;

  EXCEPTION
    WHEN OTHERS THEN
      -- Never fail authentication - return original event
      RETURN event;
  END;
  $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.companies TO supabase_auth_admin;
GRANT SELECT ON public.subscriptions TO supabase_auth_admin;

-- =====================================================
-- 2. CREATE CLIENT SIGNUP
-- =====================================================
-- Cria um novo cliente completo com empresa e assinatura

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
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_slug_counter INTEGER := 0;
  v_slug_exists BOOLEAN;
BEGIN
  -- 1. Gerar slug único para a empresa
  v_base_slug := lower(replace(replace(p_prospect_data->>'company_name', ' ', '-'), '.', ''));
  v_final_slug := v_base_slug;
  
  -- Verificar se o slug já existe e gerar um único se necessário
  LOOP
    SELECT EXISTS(SELECT 1 FROM companies WHERE slug = v_final_slug) INTO v_slug_exists;
    
    IF NOT v_slug_exists THEN
      EXIT; -- Slug é único, sair do loop
    END IF;
    
    -- Incrementar contador e tentar novamente
    v_slug_counter := v_slug_counter + 1;
    v_final_slug := v_base_slug || '-' || v_slug_counter;
  END LOOP;

  -- 2. Criar empresa baseada nos dados do prospect
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
    p_prospect_data->>'company_name',
    v_final_slug,
    p_prospect_data->>'contact_email',
    p_prospect_data->>'contact_phone',
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
    company_id,
    is_active,
    is_verified,
    verification_level,
    terms_accepted_at,
    privacy_policy_accepted_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_prospect_data->>'contact_email',
    p_prospect_data->>'contact_name',
    split_part(p_prospect_data->>'contact_name', ' ', 1),
    trim(replace(p_prospect_data->>'contact_name', split_part(p_prospect_data->>'contact_name', ' ', 1), '')),
    p_prospect_data->>'contact_phone',
    p_prospect_data->>'contact_phone',
    v_client_role_id,
    v_profile_id,
    v_company_id,
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
    p_prospect_data->>'plan',
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

  -- 7. Relacionamento user-profile já estabelecido via campo profile_id na tabela users
  -- Não é mais necessário inserir em user_profiles (tabela removida)

  -- 8. Configurar checklist de onboarding para a nova empresa
  PERFORM setup_company_onboarding_checklist(v_company_id, p_prospect_data->>'plan');

  -- Preparar resultado
  v_result := jsonb_build_object(
    'success', true,
    'company_id', v_company_id,
    'user_id', p_user_id,
    'profile_id', v_profile_id,
    'subscription_id', v_subscription_id,
    'plan', p_prospect_data->>'plan',
    'company_name', p_prospect_data->>'company_name'
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

-- =====================================================
-- 3. CREATE BPO OPERATOR SIGNUP
-- =====================================================
-- Criar operador BPO - apenas usuário com role bpo_side

CREATE OR REPLACE FUNCTION create_bpo_operator_signup(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bpo_role_id UUID;
    v_result JSON;
BEGIN
    -- 1. Buscar role_id para 'bpo_side'
    SELECT id INTO v_bpo_role_id 
    FROM roles 
    WHERE name = 'bpo_side'
    LIMIT 1;
    
    IF v_bpo_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "bpo_side" não encontrada na tabela roles.';
    END IF;
    
    -- 2. Criar registro na tabela users
    INSERT INTO users (
        id, 
        email, 
        full_name,
        first_name,
        last_name,
        phone,
        role_id,
        is_active,
        is_verified,
        verification_level,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_email,
        p_full_name,
        SPLIT_PART(p_full_name, ' ', 1), -- primeiro nome
        CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(p_full_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(p_full_name FROM POSITION(' ' IN p_full_name) + 1))
            ELSE ''
        END, -- último nome(s)
        p_phone,
        v_bpo_role_id,
        true, -- is_active
        true, -- is_verified (operadores BPO são verificados por padrão)
        'full', -- verification_level
        NOW(),
        NOW()
    );
    
    -- 3. Montar resposta de sucesso
    v_result := json_build_object(
        'success', true,
        'user_id', p_user_id,
        'email', p_email,
        'full_name', p_full_name,
        'role', 'bpo_side',
        'created_at', NOW()
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Email já está em uso: %', p_email;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar operador BPO: %', SQLERRM;
        
END;
$$;

-- =====================================================
-- COMMENTS E PERMISSIONS
-- =====================================================

-- Comentários sobre a função create_client_signup
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
7. Retorna resultado em JSONB (relacionamento user-profile via campo direto)';

-- Garante permissões corretas
GRANT EXECUTE ON FUNCTION public.create_client_signup TO service_role;
GRANT EXECUTE ON FUNCTION public.create_client_signup TO postgres;

COMMIT;