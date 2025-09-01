-- =============================================================================
-- Add Missing Procedures to Local Database
-- =============================================================================
-- Add the 5 remaining essential functions from procedures folder

-- =============================================================================
-- 1. CREATE CLIENT SIGNUP FUNCTION
-- =============================================================================

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
    segmento,
    subscription_plan,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_prospect_data->>'nome_empresa',
    lower(replace(replace(p_prospect_data->>'nome_empresa', ' ', '-'), '.', '')),
    p_prospect_data->>'email_contato',
    p_prospect_data->>'telefone_contato',
    p_prospect_data->>'cnpj',
    COALESCE(p_prospect_data->>'segmento', 'Não Informado'),
    p_prospect_data->>'plano',
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
    company_id,
    role_id,
    department,
    position,
    created_at,
    updated_at
  ) VALUES (
    v_company_id,
    v_client_role_id,
    'Administração',
    'Administrador',
    NOW(),
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
    created_at
  ) VALUES (
    v_company_id,
    p_prospect_data->>'plano',
    'active',
    NOW()
  ) RETURNING id INTO v_subscription_id;

  -- 6. Vincular usuário ao profile
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

  -- 7. Configurar checklist de onboarding para a nova empresa
  PERFORM setup_company_onboarding_checklist(v_company_id, p_prospect_data->>'plano');

  -- 8. Configurar rotinas baseadas no plano de assinatura
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

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro durante criação do cliente: %', SQLERRM;
END;
$$;

-- =============================================================================
-- 2. SETUP COMPANY ONBOARDING CHECKLIST FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.setup_company_onboarding_checklist(
  p_company_id UUID,
  p_plan TEXT DEFAULT 'controle'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir todos os itens de checklist para a empresa baseado no plano
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    is_checked,
    checked_at,
    checked_by,
    notes,
    created_at,
    updated_at,
    title,
    description,
    week,
    display_order,
    enabled_plans,
    responsible_department
  )
  SELECT 
    p_company_id,
    oc.id,
    false,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    oc.title,
    oc.description,
    oc.week,
    oc.display_order,
    oc.enabled_plans,
    oc.responsible_department
  FROM onboarding_checklist oc
  WHERE p_plan = ANY(oc.enabled_plans)
  AND NOT EXISTS (
    SELECT 1 
    FROM companies_onboarding_checklist coc 
    WHERE coc.company_id = p_company_id 
    AND coc.checklist_item_id = oc.id
  );
END;
$$;

-- =============================================================================
-- 3. SETUP COMPANY ROUTINES FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.setup_company_routines(
  p_company_id UUID,
  p_plan TEXT DEFAULT 'controle'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir rotinas padrão para a empresa baseado no plano
  INSERT INTO companies_routines (
    company_id,
    routine_id,
    custom_name,
    custom_description,
    custom_frequency,
    custom_priority,
    is_active,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    r.id,
    r.name,
    r.description,
    r.frequency,
    r.priority,
    true,
    NOW(),
    NOW()
  FROM routines r
  WHERE r.is_template = true
  AND r.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM companies_routines cr 
    WHERE cr.company_id = p_company_id 
    AND cr.routine_id = r.id
  );
END;
$$;

-- =============================================================================
-- 4. UPDATE ONBOARDING PROGRESS FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_onboarding_progress(
  p_company_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_items INTEGER;
  v_completed_items INTEGER;
  v_progress_percentage INTEGER;
BEGIN
  -- Contar total de itens no checklist da empresa
  SELECT COUNT(*) INTO v_total_items
  FROM companies_onboarding_checklist
  WHERE company_id = p_company_id;

  -- Contar itens completados
  SELECT COUNT(*) INTO v_completed_items
  FROM companies_onboarding_checklist
  WHERE company_id = p_company_id
  AND is_checked = true;

  -- Calcular porcentagem
  IF v_total_items > 0 THEN
    v_progress_percentage := ROUND((v_completed_items::DECIMAL / v_total_items::DECIMAL) * 100);
  ELSE
    v_progress_percentage := 0;
  END IF;

  -- Atualizar campo onboarding_progress na tabela companies
  UPDATE companies
  SET 
    onboarding_progress = v_progress_percentage,
    updated_at = NOW()
  WHERE id = p_company_id;

  RETURN v_progress_percentage;
END;
$$;

-- =============================================================================
-- 5. EXECUTE ROUTINE FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.execute_routine(
  p_company_routine_id UUID,
  p_executed_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL,
  p_time_spent_minutes INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_execution_id UUID;
BEGIN
  -- Inserir registro de execução
  INSERT INTO routine_executions (
    company_routine_id,
    executed_at,
    executed_by,
    status,
    notes,
    attachments,
    time_spent_minutes,
    created_at,
    updated_at
  ) VALUES (
    p_company_routine_id,
    NOW(),
    p_executed_by,
    'completed',
    p_notes,
    p_attachments,
    p_time_spent_minutes,
    NOW(),
    NOW()
  ) RETURNING id INTO v_execution_id;

  -- Atualizar última execução na rotina da empresa
  UPDATE companies_routines
  SET 
    last_completed_at = NOW(),
    last_completed_by = p_executed_by,
    completion_count = completion_count + 1,
    last_execution_date = NOW(),
    updated_at = NOW()
  WHERE id = p_company_routine_id;

  RETURN v_execution_id;
END;
$$;

-- =============================================================================
-- 6. EXTRACT USER NAMES FUNCTION (UTILITY)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.extract_user_names()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extrair primeiro e último nome do full_name se não fornecidos
  IF NEW.first_name IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.first_name := split_part(NEW.full_name, ' ', 1);
  END IF;

  IF NEW.last_name IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.last_name := trim(replace(NEW.full_name, split_part(NEW.full_name, ' ', 1), ''));
  END IF;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.create_client_signup TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_routines TO service_role;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_routine TO service_role;
GRANT EXECUTE ON FUNCTION public.extract_user_names TO service_role;

-- Create trigger for extract_user_names
DROP TRIGGER IF EXISTS users_extract_names_trigger ON users;
CREATE TRIGGER users_extract_names_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION extract_user_names();

-- =============================================================================
-- COMPLETE! Added 6 essential functions to local database
-- =============================================================================