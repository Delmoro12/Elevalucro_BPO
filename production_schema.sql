

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."cleanup_user_data"("user_email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_uuid uuid;
    company_uuid uuid;
    result text;
BEGIN
    -- Get user ID from auth
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NOT NULL THEN
        -- Get company ID from users table
        SELECT p.company_id INTO company_uuid 
        FROM users u 
        JOIN profiles p ON u.profile_id = p.id 
        WHERE u.id = user_uuid;
        
        -- Delete from all related tables (in correct order)
        DELETE FROM permissions WHERE profile_id IN 
            (SELECT id FROM profiles WHERE company_id = company_uuid);
        DELETE FROM user_profiles WHERE user_id = user_uuid;
        DELETE FROM users WHERE id = user_uuid;
        DELETE FROM subscriptions WHERE company_id = company_uuid;
        DELETE FROM profiles WHERE company_id = company_uuid;
        DELETE FROM companies WHERE id = company_uuid;
        
        -- Delete from auth tables
        DELETE FROM auth.identities WHERE user_id = user_uuid;
        DELETE FROM auth.users WHERE id = user_uuid;
        
        result := 'Cleaned all data for user: ' || user_email;
    ELSE
        result := 'User not found: ' || user_email;
    END IF;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."cleanup_user_data"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_auth_user_direct"("user_id" "uuid", "email" "text", "password" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  encrypted_pw text;
BEGIN
  -- Generate password hash
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  -- Insert directly into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  );
  
  -- Insert into auth.identities with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_id,
    jsonb_build_object('sub', user_id::text, 'email', email),
    'email',
    user_id::text,
    NOW(),
    NOW()
  );
  
END;
$$;


ALTER FUNCTION "public"."create_auth_user_direct"("user_id" "uuid", "email" "text", "password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") IS 'Fixed version: Now correctly passes subscription_plan to setup_company_onboarding_checklist.
This ensures the correct number of checklist items are created for each plan:
- controle: 16 items
- gerencial: 18 items  
- avancado: 20 items
Including plan-specific items like "Primeira reunião de consultoria" for avancado plan.';



CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_profile_id uuid;
  v_role_name text;
  v_subscription_plan text;
  v_subscription_status text;
  v_existing_metadata jsonb;
  v_claims jsonb;
BEGIN
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Get user data with role, company and subscription information
  -- Use COALESCE to handle cases where user doesn't exist in public.users yet
  BEGIN
    SELECT 
      p.company_id,
      u.profile_id,
      r.name as role_name,
      s.plan_type as subscription_plan,
      s.status as subscription_status
    INTO v_company_id, v_profile_id, v_role_name, v_subscription_plan, v_subscription_status
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_active = true
    LEFT JOIN profiles p ON (u.profile_id = p.id OR up.profile_id = p.id)
    LEFT JOIN roles r ON p.role_id = r.id
    LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
    WHERE u.id = v_user_id
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      -- If user doesn't exist yet, set all values to null
      v_company_id := NULL;
      v_profile_id := NULL;
      v_role_name := NULL;
      v_subscription_plan := NULL;
      v_subscription_status := NULL;
  END;

  -- Get existing claims or create new object
  v_claims := COALESCE(event->'claims', '{}'::jsonb);
  
  -- Get existing metadata or create new
  v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

  -- Add company_id if exists
  IF v_company_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('company_id', v_company_id::text);
  END IF;

  -- Add profile_id if exists  
  IF v_profile_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id::text);
  END IF;

  -- Add role information if exists
  IF v_role_name IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('role', v_role_name);
  END IF;

  -- Add subscription plan if exists
  IF v_subscription_plan IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'subscription_plan', v_subscription_plan,
      'subscription_status', COALESCE(v_subscription_status, 'inactive')
    );
  END IF;

  -- Add hook execution metadata
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.2.1'
  );

  -- Update claims with metadata
  v_claims := v_claims || jsonb_build_object('user_metadata', v_existing_metadata);
  
  -- Also add role to app_metadata for compatibility
  IF v_role_name IS NOT NULL THEN
    v_claims := v_claims || jsonb_build_object(
      'app_metadata', 
      COALESCE(v_claims->'app_metadata', '{}'::jsonb) || jsonb_build_object('role', v_role_name)
    );
  END IF;
  
  -- Update event with new claims
  event := event || jsonb_build_object('claims', v_claims);

  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail authentication on error
    RAISE WARNING 'JWT Hook Error: %', SQLERRM;
    RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_primary_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se está marcando como primário
    IF NEW.is_primary_role = true THEN
        -- Remove a flag de outros roles do mesmo usuário/empresa
        UPDATE user_company_roles 
        SET is_primary_role = false 
        WHERE user_company_id = NEW.user_company_id 
        AND role_id != NEW.role_id 
        AND is_primary_role = true;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_primary_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying DEFAULT 'completed'::character varying, "p_notes" "text" DEFAULT NULL::"text", "p_attachments" "text"[] DEFAULT NULL::"text"[], "p_time_spent_minutes" integer DEFAULT NULL::integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_routine_frequency VARCHAR(20);
  v_next_due_date DATE;
  v_execution_id UUID;
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Executing routine - Company Routine: %, User: %', p_company_routine_id, p_executed_by;

  -- Get routine frequency to calculate next execution
  SELECT COALESCE(cr.custom_frequency, r.frequency)
  INTO v_routine_frequency
  FROM companies_routines cr
  JOIN routines r ON cr.routine_id = r.id
  WHERE cr.id = p_company_routine_id;

  IF v_routine_frequency IS NULL THEN
    RAISE EXCEPTION 'Company routine not found: %', p_company_routine_id;
  END IF;

  -- For now, just set a simple next execution date
  v_next_due_date := CURRENT_DATE + INTERVAL '1 month';

  -- Insert execution record
  INSERT INTO routine_executions (
    company_routine_id,
    executed_at,
    executed_by,
    status,
    notes,
    attachments,
    time_spent_minutes,
    next_execution_date,
    created_at,
    updated_at
  ) VALUES (
    p_company_routine_id,
    NOW(),
    p_executed_by,
    p_status,
    p_notes,
    p_attachments,
    p_time_spent_minutes,
    v_next_due_date,
    NOW(),
    NOW()
  ) RETURNING id INTO v_execution_id;

  -- Update company routine with last execution info
  UPDATE companies_routines 
  SET 
    last_completed_at = NOW(),
    last_completed_by = p_executed_by,
    completion_count = completion_count + 1,
    updated_at = NOW()
  WHERE id = p_company_routine_id;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'execution_id', v_execution_id,
    'company_routine_id', p_company_routine_id,
    'executed_by', p_executed_by,
    'status', p_status,
    'next_due_date', v_next_due_date,
    'frequency', v_routine_frequency,
    'message', format('Routine executed successfully. Next due: %s', v_next_due_date)
  );

  -- Log completion
  RAISE LOG 'Routine execution completed - Execution ID: %, Next due: %', 
    v_execution_id, v_next_due_date;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error executing routine %: %', p_company_routine_id, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_routine_id', p_company_routine_id,
    'error', SQLERRM,
    'message', 'Failed to execute routine'
  );
END;
$$;


ALTER FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying, "p_notes" "text", "p_attachments" "text"[], "p_time_spent_minutes" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying, "p_notes" "text", "p_attachments" "text"[], "p_time_spent_minutes" integer) IS 'Records routine execution and updates completion tracking';



CREATE OR REPLACE FUNCTION "public"."extract_user_names"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        -- Extrair primeiro nome
        NEW.first_name = COALESCE(NEW.first_name, SPLIT_PART(NEW.full_name, ' ', 1));
        
        -- Extrair último nome (tudo após o primeiro espaço)
        IF POSITION(' ' IN NEW.full_name) > 0 THEN
            NEW.last_name = COALESCE(NEW.last_name, SUBSTRING(NEW.full_name FROM POSITION(' ' IN NEW.full_name) + 1));
        END IF;
        
        -- Display name padrão é o primeiro nome
        NEW.display_name = COALESCE(NEW.display_name, NEW.first_name);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."extract_user_names"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying DEFAULT NULL::character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_items_created INTEGER := 0;
  v_result JSONB;
  v_plan VARCHAR(50) := COALESCE(p_subscription_plan, 'controle');
BEGIN
  -- Log start
  RAISE LOG 'Setting up onboarding checklist for company: % with plan: %', p_company_id, v_plan;

  -- Create checklist items for the company based on active templates
  -- Insert denormalized data for performance
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    title,
    description,
    week,
    display_order,
    enabled_plans,
    responsible_department,
    is_checked,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    oc.id,
    oc.title,
    oc.description,
    oc.week,
    oc.display_order,
    oc.enabled_plans,
    oc.responsible_department,
    false, -- all items start unchecked
    NOW(),
    NOW()
  FROM onboarding_checklist oc
  WHERE oc.is_active = true
  AND v_plan = ANY(oc.enabled_plans) -- Filter by subscription plan
  ORDER BY oc.week ASC, oc.display_order ASC;

  -- Get count of items created
  GET DIAGNOSTICS v_items_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_plan', v_plan,
    'items_created', v_items_created,
    'message', format('%s onboarding checklist items created for %s plan', v_items_created, v_plan)
  );

  -- Log completion
  RAISE LOG 'Onboarding checklist setup completed - Company: %, Plan: %, Items created: %', 
    p_company_id, v_plan, v_items_created;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error setting up onboarding checklist for company % with plan %: %', p_company_id, v_plan, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'subscription_plan', v_plan,
    'error', SQLERRM,
    'message', 'Failed to create onboarding checklist'
  );
END;
$$;


ALTER FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying) IS 'Creates onboarding checklist items for a new company based on active templates and subscription plan.
Now inserts denormalized data for better performance.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado) - defaults to controle
Returns: JSONB with success status and created items count';



CREATE OR REPLACE FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_routines_created INTEGER := 0;
  v_result JSONB;
  v_start_date DATE := CURRENT_DATE;
BEGIN
  -- Log start
  RAISE LOG 'Setting up routines for company: % with plan: %', p_company_id, p_subscription_plan;

  -- Create routine assignments for the company based on subscription plan
  INSERT INTO companies_routines (
    company_id,
    routine_id,
    is_active,
    start_date,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    r.id,
    true,
    v_start_date,
    NOW(),
    NOW()
  FROM routines r
  WHERE r.is_active = true
  AND r.is_template = true
  ORDER BY r.priority DESC, r.name ASC;

  -- Get count of routines created
  GET DIAGNOSTICS v_routines_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_plan', p_subscription_plan,
    'routines_created', v_routines_created,
    'start_date', v_start_date,
    'message', format('%s routines created for %s plan', v_routines_created, p_subscription_plan)
  );

  -- Log completion
  RAISE LOG 'Company routines setup completed - Company: %, Plan: %, Routines created: %', 
    p_company_id, p_subscription_plan, v_routines_created;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error setting up routines for company % with plan %: %', p_company_id, p_subscription_plan, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'subscription_plan', p_subscription_plan,
    'error', SQLERRM,
    'message', 'Failed to create company routines'
  );
END;
$$;


ALTER FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) IS 'Creates routine assignments for a new company based on subscription plan';



CREATE OR REPLACE FUNCTION "public"."sync_user_company_roles_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    uc_record user_companies%ROWTYPE;
BEGIN
    -- Buscar dados da user_companies
    SELECT * INTO uc_record FROM user_companies WHERE id = NEW.user_company_id;
    
    IF FOUND THEN
        NEW.user_id = uc_record.user_id;
        NEW.company_id = uc_record.company_id;
    ELSE
        RAISE EXCEPTION 'user_company_id % not found', NEW.user_company_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_company_roles_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_permissions_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    uc_record user_companies%ROWTYPE;
BEGIN
    -- Buscar dados da user_companies
    SELECT * INTO uc_record FROM user_companies WHERE id = NEW.user_company_id;
    
    IF FOUND THEN
        NEW.user_id = uc_record.user_id;
        NEW.company_id = uc_record.company_id;
    ELSE
        RAISE EXCEPTION 'user_company_id % not found', NEW.user_company_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_permissions_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_jwt_hook_for_user"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_company_id uuid;
  v_profile_id uuid;
  v_role_name text;
  v_subscription_plan text;
  v_subscription_status text;
  v_result jsonb;
BEGIN
  -- Get user data with role, company and subscription information
  SELECT 
    p.company_id,
    u.profile_id,
    r.name as role_name,
    s.plan_type as subscription_plan,
    s.status as subscription_status
  INTO v_company_id, v_profile_id, v_role_name, v_subscription_plan, v_subscription_status
  FROM users u
  LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_active = true
  LEFT JOIN profiles p ON (u.profile_id = p.id OR up.profile_id = p.id)
  LEFT JOIN roles r ON p.role_id = r.id
  LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
  WHERE u.id = p_user_id
  LIMIT 1;

  -- Build result similar to JWT hook
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'company_id', COALESCE(v_company_id::text, 'null'),
    'profile_id', COALESCE(v_profile_id::text, 'null'),
    'role_name', COALESCE(v_role_name, 'null'),
    'subscription_plan', COALESCE(v_subscription_plan, 'null'),
    'subscription_status', COALESCE(v_subscription_status, 'null')
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."test_jwt_hook_for_user"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_companies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_companies_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_total_items INTEGER := 0;
  v_completed_items INTEGER := 0;
  v_progress_percentage INTEGER := 0;
  v_old_progress INTEGER;
  v_old_lifecycle_stage VARCHAR(20);
  v_new_lifecycle_stage VARCHAR(20);
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Updating onboarding progress for company: %', p_company_id;

  -- Get current values
  SELECT onboarding_progress, lifecycle_stage 
  INTO v_old_progress, v_old_lifecycle_stage
  FROM companies 
  WHERE id = p_company_id;

  -- Calculate progress
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_checked = true) as completed
  INTO v_total_items, v_completed_items
  FROM companies_onboarding_checklist coc
  JOIN onboarding_checklist oc ON coc.checklist_item_id = oc.id
  WHERE coc.company_id = p_company_id
  AND oc.is_active = true;

  -- Calculate percentage (avoid division by zero)
  IF v_total_items > 0 THEN
    v_progress_percentage := ROUND((v_completed_items * 100.0) / v_total_items);
  ELSE
    v_progress_percentage := 0;
  END IF;

  -- Determine lifecycle stage based on progress
  IF v_progress_percentage = 100 THEN
    v_new_lifecycle_stage := 'production';
  ELSE
    v_new_lifecycle_stage := 'onboarding';
  END IF;

  -- Update company progress and lifecycle stage
  UPDATE companies 
  SET 
    onboarding_progress = v_progress_percentage,
    lifecycle_stage = v_new_lifecycle_stage,
    updated_at = NOW()
  WHERE id = p_company_id;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'total_items', v_total_items,
    'completed_items', v_completed_items,
    'progress_percentage', v_progress_percentage,
    'old_progress', v_old_progress,
    'lifecycle_stage', v_new_lifecycle_stage,
    'lifecycle_changed', (v_old_lifecycle_stage != v_new_lifecycle_stage),
    'message', format('Progress updated to %s%% (%s/%s items)', 
                     v_progress_percentage, v_completed_items, v_total_items)
  );

  -- Log completion
  RAISE LOG 'Onboarding progress updated - Company: %, Progress: %s%% (%s/%s), Lifecycle: % -> %', 
    p_company_id, v_progress_percentage, v_completed_items, v_total_items, 
    v_old_lifecycle_stage, v_new_lifecycle_stage;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error updating onboarding progress for company %: %', p_company_id, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'error', SQLERRM,
    'message', 'Failed to update onboarding progress'
  );
END;
$$;


ALTER FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") IS 'Updates onboarding progress percentage and lifecycle stage for a company';



CREATE OR REPLACE FUNCTION "public"."update_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_role_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_role_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_roles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_companies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_companies_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_company_roles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_company_roles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_permissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_permissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_companies uc
    WHERE uc.user_id = auth.uid()
    AND uc.company_id = company_uuid
    AND uc.status = 'active'
  );
$$;


ALTER FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") IS 'Verifica se o usuário tem acesso a uma empresa específica';



CREATE OR REPLACE FUNCTION "public"."user_is_bpo"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users u
    JOIN user_profiles up ON up.id = u.profile_id
    WHERE u.id = auth.uid()
    AND up.category = 'bpo'
    AND u.is_active = true
  );
$$;


ALTER FUNCTION "public"."user_is_bpo"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_bpo"() IS 'Verifica se o usuário é da equipe BPO (ElevaLucro)';



CREATE OR REPLACE FUNCTION "public"."user_is_bpo_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users u
    JOIN user_profiles up ON up.id = u.profile_id
    WHERE u.id = auth.uid()
    AND up.slug = 'bpo_super_admin'
    AND u.is_active = true
  );
$$;


ALTER FUNCTION "public"."user_is_bpo_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_bpo_super_admin"() IS 'Verifica se o usuário é super admin BPO';



CREATE OR REPLACE FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_companies uc
    JOIN user_company_roles ucr ON ucr.user_company_id = uc.id
    JOIN user_profiles up ON up.id = ucr.profile_id
    WHERE uc.user_id = auth.uid()
    AND uc.company_id = company_uuid
    AND uc.status = 'active'
    AND ucr.is_active = true
    AND up.can_manage_company = true
  );
$$;


ALTER FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") IS 'Verifica se o usuário é admin de uma empresa específica';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "cnpj" character varying(18),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "subscription_plan" character varying(50) DEFAULT 'controle'::character varying,
    "lifecycle_stage" character varying(20) DEFAULT 'onboarding'::character varying,
    "onboarding_progress" integer DEFAULT 0,
    "email" character varying(255),
    "phone" character varying(20),
    "segmento" character varying(100),
    CONSTRAINT "companies_lifecycle_stage_check" CHECK ((("lifecycle_stage")::"text" = ANY ((ARRAY['onboarding'::character varying, 'production'::character varying])::"text"[]))),
    CONSTRAINT "companies_onboarding_progress_check" CHECK ((("onboarding_progress" >= 0) AND ("onboarding_progress" <= 100))),
    CONSTRAINT "companies_subscription_plan_check" CHECK ((("subscription_plan")::"text" = ANY ((ARRAY['controle'::character varying, 'gerencial'::character varying, 'avancado'::character varying])::"text"[])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."companies"."subscription_plan" IS 'Subscription plan: controle, gerencial, avancado';



COMMENT ON COLUMN "public"."companies"."lifecycle_stage" IS 'Company lifecycle stage: onboarding (initial setup) or production (active)';



COMMENT ON COLUMN "public"."companies"."onboarding_progress" IS 'Onboarding completion percentage (0-100%)';



COMMENT ON COLUMN "public"."companies"."email" IS 'Email principal da empresa';



COMMENT ON COLUMN "public"."companies"."phone" IS 'Telefone principal da empresa';



COMMENT ON COLUMN "public"."companies"."segmento" IS 'Segmento de mercado da empresa';



CREATE TABLE IF NOT EXISTS "public"."companies_onboarding_checklist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "checklist_item_id" "uuid" NOT NULL,
    "is_checked" boolean DEFAULT false,
    "checked_at" timestamp with time zone,
    "checked_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "observacoes" "text",
    "title" "text",
    "description" "text",
    "week" integer,
    "display_order" integer DEFAULT 0,
    "enabled_plans" "text"[] DEFAULT ARRAY['controle'::"text", 'gerencial'::"text", 'avancado'::"text"],
    "responsible_department" "text" DEFAULT 'Customer Success'::"text",
    CONSTRAINT "companies_onboarding_checklist_week_check" CHECK ((("week" IS NULL) OR ("week" = ANY (ARRAY[1, 2, 3, 4]))))
);


ALTER TABLE "public"."companies_onboarding_checklist" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies_onboarding_checklist" IS 'Tracks onboarding checklist progress for each company with denormalized checklist data for performance';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."is_checked" IS 'Simple boolean: checked or unchecked';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."checked_at" IS 'Timestamp when item was checked';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."checked_by" IS 'User who checked the item';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."notes" IS 'Optional notes about this checklist item';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."observacoes" IS 'Observações adicionais sobre o item do checklist';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."title" IS 'Denormalized title of the checklist item';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."description" IS 'Denormalized description of the checklist item';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."week" IS 'Denormalized week number (1-4) for onboarding timeline';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."display_order" IS 'Denormalized display order within the week';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."enabled_plans" IS 'Denormalized array of plans where this item is enabled';



COMMENT ON COLUMN "public"."companies_onboarding_checklist"."responsible_department" IS 'Denormalized department responsible for this task';



CREATE TABLE IF NOT EXISTS "public"."companies_routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "routine_id" "uuid" NOT NULL,
    "custom_name" "text",
    "custom_description" "text",
    "custom_instructions" "text",
    "custom_frequency" character varying(20),
    "custom_priority" character varying(20),
    "assigned_to" "uuid",
    "assigned_team" character varying(100),
    "start_date" "date",
    "end_date" "date",
    "day_of_week" integer,
    "day_of_month" integer,
    "month_of_year" integer,
    "last_completed_at" timestamp with time zone,
    "last_completed_by" "uuid",
    "completion_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_paused" boolean DEFAULT false,
    "pause_reason" "text",
    "notify_before_hours" integer DEFAULT 24,
    "notify_on_overdue" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "next_execution_date" timestamp with time zone,
    "last_execution_date" timestamp with time zone,
    "notes" "text",
    CONSTRAINT "companies_routines_custom_priority_check" CHECK ((("custom_priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying, NULL::character varying])::"text"[]))),
    CONSTRAINT "companies_routines_day_of_month_check" CHECK ((("day_of_month" >= 1) AND ("day_of_month" <= 31))),
    CONSTRAINT "companies_routines_day_of_week_check" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 7))),
    CONSTRAINT "companies_routines_month_of_year_check" CHECK ((("month_of_year" >= 1) AND ("month_of_year" <= 12)))
);


ALTER TABLE "public"."companies_routines" OWNER TO "postgres";


COMMENT ON TABLE "public"."companies_routines" IS 'Links companies to their specific routine tasks with customizations';



COMMENT ON COLUMN "public"."companies_routines"."next_execution_date" IS 'Data da próxima execução programada';



COMMENT ON COLUMN "public"."companies_routines"."last_execution_date" IS 'Data da última execução realizada';



COMMENT ON COLUMN "public"."companies_routines"."notes" IS 'Observações sobre a rotina específica da empresa';



CREATE TABLE IF NOT EXISTS "public"."routine_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_routine_id" "uuid" NOT NULL,
    "executed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "executed_by" "uuid",
    "status" character varying(20) DEFAULT 'completed'::character varying,
    "notes" "text",
    "attachments" "text"[],
    "time_spent_minutes" integer,
    "next_execution_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "routine_executions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."routine_executions" OWNER TO "postgres";


COMMENT ON TABLE "public"."routine_executions" IS 'History of routine executions for companies';



COMMENT ON COLUMN "public"."routine_executions"."company_routine_id" IS 'Reference to the company routine that was executed';



COMMENT ON COLUMN "public"."routine_executions"."executed_at" IS 'When the routine was executed';



COMMENT ON COLUMN "public"."routine_executions"."executed_by" IS 'User who executed the routine';



COMMENT ON COLUMN "public"."routine_executions"."status" IS 'Execution status: completed, partially_completed, failed';



COMMENT ON COLUMN "public"."routine_executions"."notes" IS 'Notes about the execution';



COMMENT ON COLUMN "public"."routine_executions"."attachments" IS 'Array of attachment URLs (documents, screenshots, etc)';



COMMENT ON COLUMN "public"."routine_executions"."time_spent_minutes" IS 'Time spent on execution in minutes';



COMMENT ON COLUMN "public"."routine_executions"."next_execution_date" IS 'Calculated date for next execution';



CREATE TABLE IF NOT EXISTS "public"."routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" character varying(50),
    "frequency" character varying(20),
    "priority" character varying(20) DEFAULT 'medium'::character varying,
    "estimated_hours" numeric(5,2),
    "is_active" boolean DEFAULT true,
    "is_template" boolean DEFAULT true,
    "instructions" "text",
    "requirements" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "routines_frequency_check" CHECK ((("frequency")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying, 'custom'::character varying])::"text"[]))),
    CONSTRAINT "routines_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."routines" OWNER TO "postgres";


COMMENT ON TABLE "public"."routines" IS 'Master table for all routine task definitions';



CREATE OR REPLACE VIEW "public"."companies_routines_summary" AS
 SELECT "c"."id" AS "company_id",
    "c"."name" AS "nome_empresa",
    ''::"text" AS "email",
    ''::"text" AS "telefone",
    ''::"text" AS "segmento",
    "c"."subscription_plan" AS "plano",
    "c"."lifecycle_stage",
    "c"."created_at",
    "count"("cr"."routine_id") AS "total_rotinas",
    "count"("cr"."routine_id") FILTER (WHERE ("cr"."is_active" = true)) AS "rotinas_ativas",
    "count"("cr"."routine_id") FILTER (WHERE ("cr"."is_active" = false)) AS "rotinas_inativas",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."frequency")::"text" = 'daily'::"text")) AS "rotinas_diarias",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."frequency")::"text" = 'weekly'::"text")) AS "rotinas_semanais",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."frequency")::"text" = 'monthly'::"text")) AS "rotinas_mensais",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."frequency")::"text" = 'quarterly'::"text")) AS "rotinas_trimestrais",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."category")::"text" = 'financial'::"text")) AS "rotinas_financeiras",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."category")::"text" = 'operational'::"text")) AS "rotinas_operacionais",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."category")::"text" = 'compliance'::"text")) AS "rotinas_compliance",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."category")::"text" = 'reporting'::"text")) AS "rotinas_relatorios",
    "count"("cr"."routine_id") FILTER (WHERE (("r"."category")::"text" = 'analysis'::"text")) AS "rotinas_analise",
    "count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))) AS "execucoes_ultimo_mes",
    "count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[])))) AS "execucoes_completadas_mes",
    "count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = 'failed'::"text"))) AS "execucoes_falharam_mes",
    ( SELECT "json_build_object"('routine_title', "r_next"."name", 'next_execution', "cr_next"."next_execution_date", 'frequency', "r_next"."frequency", 'category', "r_next"."category") AS "json_build_object"
           FROM ("public"."companies_routines" "cr_next"
             JOIN "public"."routines" "r_next" ON (("cr_next"."routine_id" = "r_next"."id")))
          WHERE (("cr_next"."company_id" = "c"."id") AND ("cr_next"."is_active" = true) AND ("cr_next"."next_execution_date" IS NOT NULL) AND ("cr_next"."next_execution_date" > "now"()))
          ORDER BY "cr_next"."next_execution_date"
         LIMIT 1) AS "proxima_rotina",
    "count"("cr"."routine_id") FILTER (WHERE (("cr"."is_active" = true) AND ("cr"."next_execution_date" IS NOT NULL) AND ("cr"."next_execution_date" < "now"()))) AS "rotinas_atrasadas",
        CASE
            WHEN ("count"("cr"."routine_id") = 0) THEN (0)::double precision
            ELSE GREATEST((0)::double precision, LEAST((100)::double precision, ((((("count"("cr"."routine_id") FILTER (WHERE ("cr"."is_active" = true)))::double precision / (GREATEST((1)::bigint, "count"("cr"."routine_id")))::double precision) * (40)::double precision) + ((("count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[])))))::double precision / (GREATEST((1)::bigint, "count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval)))))::double precision) * (40)::double precision)) + ((20 - LEAST((20)::bigint, ("count"("cr"."routine_id") FILTER (WHERE (("cr"."is_active" = true) AND ("cr"."next_execution_date" IS NOT NULL) AND ("cr"."next_execution_date" < "now"()))) * 5))))::double precision)))
        END AS "health_score",
        CASE
            WHEN (("c"."subscription_plan")::"text" = 'controle'::"text") THEN 950.00
            WHEN (("c"."subscription_plan")::"text" = 'gerencial'::"text") THEN 1300.00
            WHEN (("c"."subscription_plan")::"text" = 'avancado'::"text") THEN 1700.00
            ELSE 0.00
        END AS "valor_mensal"
   FROM ((("public"."companies" "c"
     LEFT JOIN "public"."companies_routines" "cr" ON (("c"."id" = "cr"."company_id")))
     LEFT JOIN "public"."routines" "r" ON (("cr"."routine_id" = "r"."id")))
     LEFT JOIN "public"."routine_executions" "rh" ON (("cr"."id" = "rh"."company_routine_id")))
  WHERE ("c"."is_active" = true)
  GROUP BY "c"."id", "c"."name", "c"."subscription_plan", "c"."lifecycle_stage", "c"."created_at"
  ORDER BY
        CASE
            WHEN ("count"("cr"."routine_id") = 0) THEN (0)::double precision
            ELSE GREATEST((0)::double precision, LEAST((100)::double precision, ((((("count"("cr"."routine_id") FILTER (WHERE ("cr"."is_active" = true)))::double precision / (GREATEST((1)::bigint, "count"("cr"."routine_id")))::double precision) * (40)::double precision) + ((("count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[])))))::double precision / (GREATEST((1)::bigint, "count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval)))))::double precision) * (40)::double precision)) + ((20 - LEAST((20)::bigint, ("count"("cr"."routine_id") FILTER (WHERE (("cr"."is_active" = true) AND ("cr"."next_execution_date" IS NOT NULL) AND ("cr"."next_execution_date" < "now"()))) * 5))))::double precision)))
        END DESC, "c"."name";


ALTER VIEW "public"."companies_routines_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."companies_routines_summary" IS 'View para resumo das rotinas por empresa - dashboard operacional com métricas de execução,
health score, próximas rotinas e estatísticas por categoria/frequência.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "phone" character varying(20),
    "role_id" "uuid",
    "profile_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "first_name" character varying(100),
    "last_name" character varying(100),
    "whatsapp" character varying(20),
    "is_verified" boolean DEFAULT false,
    "verification_level" character varying(20) DEFAULT 'none'::character varying,
    "terms_accepted_at" timestamp with time zone,
    "privacy_policy_accepted_at" timestamp with time zone,
    "marketing_consent_at" timestamp with time zone,
    CONSTRAINT "users_verification_level_check" CHECK ((("verification_level")::"text" = ANY ((ARRAY['none'::character varying, 'email'::character varying, 'phone'::character varying, 'document'::character varying, 'full'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."first_name" IS 'Primeiro nome do usuário';



COMMENT ON COLUMN "public"."users"."last_name" IS 'Sobrenome do usuário';



COMMENT ON COLUMN "public"."users"."whatsapp" IS 'Número do WhatsApp';



COMMENT ON COLUMN "public"."users"."is_verified" IS 'Verificação de identidade';



COMMENT ON COLUMN "public"."users"."verification_level" IS 'Nível de verificação: none, email, phone, document, full';



COMMENT ON COLUMN "public"."users"."terms_accepted_at" IS 'Data de aceite dos termos de uso';



COMMENT ON COLUMN "public"."users"."privacy_policy_accepted_at" IS 'Data de aceite da política de privacidade';



COMMENT ON COLUMN "public"."users"."marketing_consent_at" IS 'Data de consentimento para marketing';



CREATE OR REPLACE VIEW "public"."company_routines_details" AS
 SELECT "c"."id" AS "company_id",
    "c"."name" AS "nome_empresa",
    ''::"text" AS "email",
    ''::"text" AS "telefone",
    ''::"text" AS "segmento",
    "c"."subscription_plan" AS "plano",
    "r"."id" AS "routine_id",
    "r"."name" AS "routine_title",
    "r"."description" AS "routine_description",
    "r"."category" AS "routine_category",
    "r"."frequency" AS "routine_frequency",
    "r"."estimated_hours" AS "routine_estimated_hours",
    "cr"."id" AS "company_routine_id",
    "cr"."is_active" AS "routine_is_active",
    "cr"."custom_frequency" AS "routine_custom_schedule",
    "cr"."next_execution_date" AS "routine_next_execution",
    "cr"."last_execution_date" AS "routine_last_execution",
    "cr"."assigned_to" AS "routine_assigned_to",
    "cr"."notes" AS "routine_notes",
    "cr"."created_at" AS "routine_added_at",
    "u"."full_name" AS "assigned_to_name",
    "u"."email" AS "assigned_to_email",
    ( SELECT "json_agg"("json_build_object"('id', "rh"."id", 'executed_at', "rh"."executed_at", 'status', "rh"."status", 'duration_minutes', "rh"."time_spent_minutes", 'executed_by_name', "u_exec"."full_name", 'executed_by_email', "u_exec"."email", 'observations', "rh"."notes", 'attachments', "rh"."attachments") ORDER BY "rh"."executed_at" DESC) AS "json_agg"
           FROM ("public"."routine_executions" "rh"
             LEFT JOIN "public"."users" "u_exec" ON (("rh"."executed_by" = "u_exec"."id")))
          WHERE ("rh"."company_routine_id" = "cr"."id")
         LIMIT 10) AS "execution_history",
    ( SELECT "json_build_object"('total_executions', "count"("rh"."id"), 'successful_executions', "count"("rh"."id") FILTER (WHERE (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[]))), 'failed_executions', "count"("rh"."id") FILTER (WHERE (("rh"."status")::"text" = 'failed'::"text")), 'avg_duration_minutes', "avg"("rh"."time_spent_minutes"), 'last_30_days_executions', "count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))), 'success_rate_30_days',
                CASE
                    WHEN ("count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))) = 0) THEN (0)::double precision
                    ELSE ((("count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[])))))::double precision / ("count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))))::double precision) * (100)::double precision)
                END) AS "json_build_object"
           FROM "public"."routine_executions" "rh"
          WHERE ("rh"."company_routine_id" = "cr"."id")) AS "execution_stats",
        CASE
            WHEN (NOT "cr"."is_active") THEN 'inactive'::"text"
            WHEN ("cr"."next_execution_date" IS NULL) THEN 'not_scheduled'::"text"
            WHEN ("cr"."next_execution_date" < "now"()) THEN 'overdue'::"text"
            WHEN ("cr"."next_execution_date" <= ("now"() + '1 day'::interval)) THEN 'due_soon'::"text"
            WHEN ("cr"."next_execution_date" <= ("now"() + '7 days'::interval)) THEN 'upcoming'::"text"
            ELSE 'scheduled'::"text"
        END AS "routine_status",
        CASE
            WHEN ("cr"."next_execution_date" IS NULL) THEN NULL::numeric
            ELSE EXTRACT(days FROM ("cr"."next_execution_date" - "now"()))
        END AS "days_until_next_execution",
        CASE
            WHEN ("cr"."last_execution_date" IS NULL) THEN NULL::numeric
            ELSE EXTRACT(days FROM ("now"() - "cr"."last_execution_date"))
        END AS "days_since_last_execution"
   FROM ((("public"."companies" "c"
     JOIN "public"."companies_routines" "cr" ON (("c"."id" = "cr"."company_id")))
     JOIN "public"."routines" "r" ON (("cr"."routine_id" = "r"."id")))
     LEFT JOIN "public"."users" "u" ON (("cr"."assigned_to" = "u"."id")))
  WHERE ("c"."is_active" = true)
  ORDER BY "c"."name",
        CASE "cr"."is_active"
            WHEN true THEN 0
            ELSE 1
        END,
        CASE
            WHEN ("cr"."next_execution_date" IS NULL) THEN 3
            WHEN ("cr"."next_execution_date" < "now"()) THEN 0
            WHEN ("cr"."next_execution_date" <= ("now"() + '1 day'::interval)) THEN 1
            ELSE 2
        END, "cr"."next_execution_date";


ALTER VIEW "public"."company_routines_details" OWNER TO "postgres";


COMMENT ON VIEW "public"."company_routines_details" IS 'View para detalhes completos das rotinas por empresa - inclui histórico de execução,
estatísticas, informações do responsável e status detalhado para gestão operacional.';



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "nome" character varying(255) NOT NULL,
    "arquivo" character varying(500) NOT NULL,
    "tipo_documento" character varying(30) NOT NULL,
    "categoria" character varying(20) NOT NULL,
    "valor" character varying(50),
    "valor_decimal" numeric(15,2),
    "data_documento" "date",
    "fornecedor" character varying(255),
    "cliente" character varying(255),
    "cnpj" character varying(18),
    "numero_nota" character varying(100),
    "descricao" "text",
    "forma_pagamento" character varying(100),
    "centro_custo" character varying(100),
    "tamanho" character varying(20),
    "tamanho_bytes" bigint,
    "data_upload" timestamp with time zone DEFAULT "now"(),
    "status" character varying(30) DEFAULT 'pendente'::character varying NOT NULL,
    "confianca_ia" integer,
    "dados_completos" boolean DEFAULT false,
    "campos_faltantes" "text"[],
    "processamento_ia" "jsonb",
    "linhas_processadas" integer,
    "linhas_total" integer,
    "erros_excel" "text"[],
    "tags" "text"[],
    "observacoes" "text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    CONSTRAINT "documents_categoria_check" CHECK ((("categoria")::"text" = ANY ((ARRAY['entrada'::character varying, 'saida'::character varying])::"text"[]))),
    CONSTRAINT "documents_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['processado'::character varying, 'pendente'::character varying, 'erro'::character varying, 'processando'::character varying])::"text"[]))),
    CONSTRAINT "documents_tipo_documento_check" CHECK ((("tipo_documento")::"text" = ANY ((ARRAY['nfe'::character varying, 'cupom_fiscal'::character varying, 'recibo'::character varying, 'boleto'::character varying, 'extrato'::character varying, 'outro'::character varying])::"text"[])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."entities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_checklist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "week" integer NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "enabled_plans" "text"[] DEFAULT ARRAY['controle'::"text", 'gerencial'::"text", 'avancado'::"text"],
    "responsible_department" "text" DEFAULT 'Customer Success'::"text",
    CONSTRAINT "onboarding_checklist_week_check" CHECK (("week" = ANY (ARRAY[1, 2, 3, 4])))
);


ALTER TABLE "public"."onboarding_checklist" OWNER TO "postgres";


COMMENT ON TABLE "public"."onboarding_checklist" IS 'Checklist items for client onboarding process organized by weeks';



COMMENT ON COLUMN "public"."onboarding_checklist"."week" IS 'Week number (1-4) for onboarding timeline';



COMMENT ON COLUMN "public"."onboarding_checklist"."display_order" IS 'Order for displaying items within the same week';



COMMENT ON COLUMN "public"."onboarding_checklist"."enabled_plans" IS 'Array of plans where this checklist item is enabled (controle, gerencial, avancado)';



COMMENT ON COLUMN "public"."onboarding_checklist"."responsible_department" IS 'Department or team responsible for completing this task';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "plan_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_plan_type_check" CHECK (("plan_type" = ANY (ARRAY['controle'::"text", 'gerencial'::"text", 'avancado'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'cancelled'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."onboarding_companies_unified" AS
 SELECT "c"."id" AS "company_id",
    "c"."name" AS "nome_empresa",
    "c"."email",
    "c"."phone" AS "telefone",
    "c"."segmento",
    "c"."subscription_plan" AS "plano",
    "c"."onboarding_progress" AS "progresso_onboarding",
    "c"."lifecycle_stage",
    "c"."created_at" AS "data_inicio",
        CASE
            WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (7)::numeric) THEN 'semana_1'::"text"
            WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (14)::numeric) THEN 'semana_2'::"text"
            WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (21)::numeric) THEN 'semana_3'::"text"
            ELSE 'semana_4'::"text"
        END AS "semana_onboarding",
    EXTRACT(days FROM ("now"() - "c"."created_at")) AS "dias_desde_criacao",
        CASE
            WHEN ("count"("coc"."id") = 0) THEN '[]'::json
            ELSE "json_agg"("json_build_object"('id', "coc"."checklist_item_id", 'title', "coc"."title", 'description', "coc"."description", 'week', "coc"."week", 'display_order', "coc"."display_order", 'enabled_plans', "coc"."enabled_plans", 'responsible_department', "coc"."responsible_department", 'is_checked', "coc"."is_checked", 'checked_at', "coc"."checked_at", 'checked_by', "u"."full_name", 'notes', "coc"."notes") ORDER BY "coc"."week", "coc"."display_order")
        END AS "checklist_items",
    "count"("coc"."id") AS "total_checklist_items",
    "count"("coc"."id") FILTER (WHERE ("coc"."is_checked" = true)) AS "completed_items",
    "count"("coc"."id") FILTER (WHERE ("coc"."is_checked" = false)) AS "pending_items",
    "count"("coc"."id") FILTER (WHERE ("coc"."week" = 1)) AS "semana_1_total",
    "count"("coc"."id") FILTER (WHERE (("coc"."week" = 1) AND ("coc"."is_checked" = true))) AS "semana_1_completed",
    "count"("coc"."id") FILTER (WHERE ("coc"."week" = 2)) AS "semana_2_total",
    "count"("coc"."id") FILTER (WHERE (("coc"."week" = 2) AND ("coc"."is_checked" = true))) AS "semana_2_completed",
    "count"("coc"."id") FILTER (WHERE ("coc"."week" = 3)) AS "semana_3_total",
    "count"("coc"."id") FILTER (WHERE (("coc"."week" = 3) AND ("coc"."is_checked" = true))) AS "semana_3_completed",
    "count"("coc"."id") FILTER (WHERE ("coc"."week" = 4)) AS "semana_4_total",
    "count"("coc"."id") FILTER (WHERE (("coc"."week" = 4) AND ("coc"."is_checked" = true))) AS "semana_4_completed",
    ( SELECT "coc_next"."title"
           FROM "public"."companies_onboarding_checklist" "coc_next"
          WHERE (("coc_next"."company_id" = "c"."id") AND ("coc_next"."is_checked" = false))
          ORDER BY "coc_next"."week", "coc_next"."display_order"
         LIMIT 1) AS "proxima_acao",
    "s"."status" AS "subscription_status",
        CASE
            WHEN (("c"."subscription_plan")::"text" = 'controle'::"text") THEN 950.00
            WHEN (("c"."subscription_plan")::"text" = 'gerencial'::"text") THEN 1300.00
            WHEN (("c"."subscription_plan")::"text" = 'avancado'::"text") THEN 1700.00
            ELSE 0.00
        END AS "valor_mensal",
        CASE
            WHEN (("c"."subscription_plan")::"text" = 'avancado'::"text") THEN 'Consultor Sênior'::"text"
            WHEN (("c"."subscription_plan")::"text" = 'gerencial'::"text") THEN 'Consultor Pleno'::"text"
            ELSE 'Consultor Junior'::"text"
        END AS "responsavel"
   FROM ((("public"."companies" "c"
     LEFT JOIN "public"."companies_onboarding_checklist" "coc" ON (("c"."id" = "coc"."company_id")))
     LEFT JOIN "public"."users" "u" ON (("coc"."checked_by" = "u"."id")))
     LEFT JOIN "public"."subscriptions" "s" ON ((("c"."id" = "s"."company_id") AND ("s"."status" = 'active'::"text"))))
  WHERE (("c"."is_active" = true) AND (("c"."lifecycle_stage")::"text" = 'onboarding'::"text"))
  GROUP BY "c"."id", "c"."name", "c"."email", "c"."phone", "c"."segmento", "c"."subscription_plan", "c"."onboarding_progress", "c"."lifecycle_stage", "c"."created_at", "s"."status"
  ORDER BY "c"."created_at";


ALTER VIEW "public"."onboarding_companies_unified" OWNER TO "postgres";


COMMENT ON VIEW "public"."onboarding_companies_unified" IS 'View unificada para onboarding - serve tanto para listagem do kanban quanto para detalhes do modal.
Usa apenas companies_onboarding_checklist (desnormalizada) para melhor performance.
Retorna lista vazia de checklist_items quando empresa não tem itens cadastrados.';



CREATE OR REPLACE VIEW "public"."operational_health_score" AS
 SELECT "c"."id" AS "company_id",
    "c"."name" AS "nome_empresa",
    ''::"text" AS "email",
    ''::"text" AS "segmento",
    "c"."subscription_plan" AS "plano",
    "c"."lifecycle_stage",
    "c"."created_at",
        CASE
            WHEN (("c"."lifecycle_stage")::"text" = 'onboarding'::"text") THEN "json_build_object"('progress_percentage', "c"."onboarding_progress", 'days_in_onboarding', EXTRACT(days FROM ("now"() - "c"."created_at")), 'expected_completion_week',
            CASE
                WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (7)::numeric) THEN 'semana_1'::"text"
                WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (14)::numeric) THEN 'semana_2'::"text"
                WHEN (EXTRACT(days FROM ("now"() - "c"."created_at")) <= (21)::numeric) THEN 'semana_3'::"text"
                ELSE 'semana_4'::"text"
            END, 'completed_items', COALESCE("onb_stats"."completed_items", (0)::bigint), 'total_items', COALESCE("onb_stats"."total_items", (0)::bigint), 'on_track',
            CASE
                WHEN (COALESCE("onb_stats"."total_items", (0)::bigint) = 0) THEN false
                WHEN ((EXTRACT(days FROM ("now"() - "c"."created_at")) <= (7)::numeric) AND ((("onb_stats"."completed_items")::double precision / ("onb_stats"."total_items")::double precision) >= (0.25)::double precision)) THEN true
                WHEN ((EXTRACT(days FROM ("now"() - "c"."created_at")) <= (14)::numeric) AND ((("onb_stats"."completed_items")::double precision / ("onb_stats"."total_items")::double precision) >= (0.50)::double precision)) THEN true
                WHEN ((EXTRACT(days FROM ("now"() - "c"."created_at")) <= (21)::numeric) AND ((("onb_stats"."completed_items")::double precision / ("onb_stats"."total_items")::double precision) >= (0.75)::double precision)) THEN true
                WHEN ((EXTRACT(days FROM ("now"() - "c"."created_at")) > (21)::numeric) AND ((("onb_stats"."completed_items")::double precision / ("onb_stats"."total_items")::double precision) >= (0.90)::double precision)) THEN true
                ELSE false
            END)
            ELSE NULL::json
        END AS "onboarding_metrics",
    "json_build_object"('total_routines', COALESCE("routine_stats"."total_routines", (0)::bigint), 'active_routines', COALESCE("routine_stats"."active_routines", (0)::bigint), 'overdue_routines', COALESCE("routine_stats"."overdue_routines", (0)::bigint), 'executions_last_30_days', COALESCE("routine_stats"."executions_30d", (0)::bigint), 'successful_executions_30d', COALESCE("routine_stats"."successful_30d", (0)::bigint), 'success_rate_30d',
        CASE
            WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
            ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (100)::double precision)
        END, 'avg_execution_time', COALESCE("routine_stats"."avg_duration", (0)::numeric)) AS "routine_metrics",
        CASE
            WHEN (("c"."lifecycle_stage")::"text" = 'onboarding'::"text") THEN GREATEST((0)::double precision, LEAST((100)::double precision, (((("c"."onboarding_progress")::numeric * 0.6))::double precision +
            CASE
                WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."successful_30d")::double precision / (GREATEST((1)::bigint, "routine_stats"."executions_30d"))::double precision) * (40)::double precision)
            END)))
            WHEN (("c"."lifecycle_stage")::"text" = 'operational'::"text") THEN GREATEST((0)::double precision, LEAST((100)::double precision, ((
            CASE
                WHEN (COALESCE("routine_stats"."total_routines", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."active_routines")::double precision / ("routine_stats"."total_routines")::double precision) * (30)::double precision)
            END +
            CASE
                WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (50)::double precision)
            END) + ((20 - LEAST((20)::bigint, (COALESCE("routine_stats"."overdue_routines", (0)::bigint) * 4))))::double precision)))
            ELSE (50)::double precision
        END AS "health_score",
        CASE
            WHEN (("c"."lifecycle_stage")::"text" = 'onboarding'::"text") THEN
            CASE
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, (((("c"."onboarding_progress")::numeric * 0.6))::double precision +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / (GREATEST((1)::bigint, "routine_stats"."executions_30d"))::double precision) * (40)::double precision)
                END))) >= (80)::double precision) THEN 'excellent'::"text"
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, (((("c"."onboarding_progress")::numeric * 0.6))::double precision +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / (GREATEST((1)::bigint, "routine_stats"."executions_30d"))::double precision) * (40)::double precision)
                END))) >= (60)::double precision) THEN 'good'::"text"
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, (((("c"."onboarding_progress")::numeric * 0.6))::double precision +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / (GREATEST((1)::bigint, "routine_stats"."executions_30d"))::double precision) * (40)::double precision)
                END))) >= (40)::double precision) THEN 'warning'::"text"
                ELSE 'critical'::"text"
            END
            WHEN (("c"."lifecycle_stage")::"text" = 'operational'::"text") THEN
            CASE
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, ((
                CASE
                    WHEN (COALESCE("routine_stats"."total_routines", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."active_routines")::double precision / ("routine_stats"."total_routines")::double precision) * (30)::double precision)
                END +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (50)::double precision)
                END) + ((20 - LEAST((20)::bigint, (COALESCE("routine_stats"."overdue_routines", (0)::bigint) * 4))))::double precision))) >= (80)::double precision) THEN 'excellent'::"text"
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, ((
                CASE
                    WHEN (COALESCE("routine_stats"."total_routines", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."active_routines")::double precision / ("routine_stats"."total_routines")::double precision) * (30)::double precision)
                END +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (50)::double precision)
                END) + ((20 - LEAST((20)::bigint, (COALESCE("routine_stats"."overdue_routines", (0)::bigint) * 4))))::double precision))) >= (60)::double precision) THEN 'good'::"text"
                WHEN (GREATEST((0)::double precision, LEAST((100)::double precision, ((
                CASE
                    WHEN (COALESCE("routine_stats"."total_routines", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."active_routines")::double precision / ("routine_stats"."total_routines")::double precision) * (30)::double precision)
                END +
                CASE
                    WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                    ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (50)::double precision)
                END) + ((20 - LEAST((20)::bigint, (COALESCE("routine_stats"."overdue_routines", (0)::bigint) * 4))))::double precision))) >= (40)::double precision) THEN 'warning'::"text"
                ELSE 'critical'::"text"
            END
            ELSE 'neutral'::"text"
        END AS "health_classification",
        CASE
            WHEN ((("c"."lifecycle_stage")::"text" = 'onboarding'::"text") AND (COALESCE("onb_stats"."completed_items", (0)::bigint) = 0)) THEN ARRAY['Iniciar checklist de onboarding'::"text", 'Atribuir responsável para acompanhamento'::"text"]
            WHEN ((("c"."lifecycle_stage")::"text" = 'onboarding'::"text") AND ("c"."onboarding_progress" < 25) AND (EXTRACT(days FROM ("now"() - "c"."created_at")) > (7)::numeric)) THEN ARRAY['Acelerar processo de onboarding'::"text", 'Revisar itens pendentes da semana 1'::"text"]
            WHEN ((("c"."lifecycle_stage")::"text" = 'operational'::"text") AND (COALESCE("routine_stats"."overdue_routines", (0)::bigint) > 0)) THEN ARRAY['Executar rotinas em atraso'::"text", 'Revisar cronograma de execução'::"text"]
            WHEN ((("c"."lifecycle_stage")::"text" = 'operational'::"text") AND (COALESCE("routine_stats"."active_routines", (0)::bigint) < 3)) THEN ARRAY['Ativar mais rotinas operacionais'::"text", 'Configurar rotinas essenciais'::"text"]
            WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN ARRAY['Executar rotinas pendentes'::"text", 'Verificar configuração de cronograma'::"text"]
            ELSE ARRAY['Manter ritmo atual'::"text", 'Monitorar indicadores regularmente'::"text"]
        END AS "recommendations",
    "now"() AS "calculated_at"
   FROM (("public"."companies" "c"
     LEFT JOIN ( SELECT "coc"."company_id",
            "count"("coc"."checklist_item_id") AS "total_items",
            "count"("coc"."checklist_item_id") FILTER (WHERE ("coc"."is_checked" = true)) AS "completed_items"
           FROM "public"."companies_onboarding_checklist" "coc"
          GROUP BY "coc"."company_id") "onb_stats" ON (("c"."id" = "onb_stats"."company_id")))
     LEFT JOIN ( SELECT "cr"."company_id",
            "count"("cr"."id") AS "total_routines",
            "count"("cr"."id") FILTER (WHERE ("cr"."is_active" = true)) AS "active_routines",
            "count"("cr"."id") FILTER (WHERE (("cr"."is_active" = true) AND ("cr"."next_execution_date" IS NOT NULL) AND ("cr"."next_execution_date" < "now"()))) AS "overdue_routines",
            "count"("rh"."id") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))) AS "executions_30d",
            "count"("rh"."id") FILTER (WHERE (("rh"."executed_at" >= ("now"() - '30 days'::interval)) AND (("rh"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'partially_completed'::character varying])::"text"[])))) AS "successful_30d",
            "avg"("rh"."time_spent_minutes") FILTER (WHERE ("rh"."executed_at" >= ("now"() - '30 days'::interval))) AS "avg_duration"
           FROM ("public"."companies_routines" "cr"
             LEFT JOIN "public"."routine_executions" "rh" ON (("cr"."id" = "rh"."company_routine_id")))
          GROUP BY "cr"."company_id") "routine_stats" ON (("c"."id" = "routine_stats"."company_id")))
  WHERE ("c"."is_active" = true)
  ORDER BY
        CASE
            WHEN (("c"."lifecycle_stage")::"text" = 'onboarding'::"text") THEN GREATEST((0)::double precision, LEAST((100)::double precision, (((("c"."onboarding_progress")::numeric * 0.6))::double precision +
            CASE
                WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."successful_30d")::double precision / (GREATEST((1)::bigint, "routine_stats"."executions_30d"))::double precision) * (40)::double precision)
            END)))
            WHEN (("c"."lifecycle_stage")::"text" = 'operational'::"text") THEN GREATEST((0)::double precision, LEAST((100)::double precision, ((
            CASE
                WHEN (COALESCE("routine_stats"."total_routines", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."active_routines")::double precision / ("routine_stats"."total_routines")::double precision) * (30)::double precision)
            END +
            CASE
                WHEN (COALESCE("routine_stats"."executions_30d", (0)::bigint) = 0) THEN (0)::double precision
                ELSE ((("routine_stats"."successful_30d")::double precision / ("routine_stats"."executions_30d")::double precision) * (50)::double precision)
            END) + ((20 - LEAST((20)::bigint, (COALESCE("routine_stats"."overdue_routines", (0)::bigint) * 4))))::double precision)))
            ELSE (50)::double precision
        END DESC, "c"."name";


ALTER VIEW "public"."operational_health_score" OWNER TO "postgres";


COMMENT ON VIEW "public"."operational_health_score" IS 'View consolidada para score de saúde operacional - combina métricas de onboarding e rotinas
para classificar empresas e gerar recomendações de ação automatizadas.';



CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "can_read" boolean DEFAULT false,
    "can_create" boolean DEFAULT false,
    "can_update" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "company_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome_contato" character varying(100) NOT NULL,
    "cpf_contato" character varying(14) NOT NULL,
    "email_contato" character varying(255) NOT NULL,
    "telefone_contato" character varying(20),
    "cargo_contato" character varying(100),
    "nome_empresa" character varying(200) NOT NULL,
    "cnpj" character varying(18) NOT NULL,
    "endereco" character varying(255),
    "numero" character varying(20),
    "bairro" character varying(100),
    "cep" character varying(9),
    "cidade" character varying(100),
    "estado" character varying(2),
    "segmento" character varying(100),
    "areas" "text"[],
    "bancos" "text"[],
    "ferramentas" "text"[],
    "fornecedores" "text"[],
    "organizacao" "text"[],
    "relatorios" "text"[],
    "expectativas_sucesso" "text",
    "plano" character varying(20) NOT NULL,
    "valor_mensal" numeric(10,2) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "origem" character varying(50),
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prospects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "is_granted" boolean DEFAULT true,
    "is_inherited" boolean DEFAULT false,
    "inherited_from_role_id" "uuid",
    "conditions" "jsonb",
    "resource_restrictions" "jsonb",
    "expires_at" timestamp with time zone,
    "is_temporary" boolean DEFAULT false,
    "granted_by_user_id" "uuid",
    "granted_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "role_permissions_inherit_not_self" CHECK (("inherited_from_role_id" <> "role_id")),
    CONSTRAINT "role_permissions_inheritance_valid" CHECK (((("is_inherited" = false) AND ("inherited_from_role_id" IS NULL)) OR (("is_inherited" = true) AND ("inherited_from_role_id" IS NOT NULL))))
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Relacionamento many-to-many entre roles e permissions';



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    CONSTRAINT "roles_name_check" CHECK (("name" = ANY (ARRAY['bpo_side'::"text", 'client_side'::"text"])))
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "join_type" character varying(20) DEFAULT 'invited'::character varying,
    "invited_by_user_id" "uuid",
    "invited_at" timestamp with time zone,
    "invitation_token" character varying(255),
    "invitation_expires_at" timestamp with time zone,
    "approved_by_user_id" "uuid",
    "approved_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "display_name" character varying(100),
    "department" character varying(100),
    "employee_id" character varying(50),
    "start_date" "date",
    "end_date" "date",
    "is_primary_company" boolean DEFAULT false,
    "default_login_company" boolean DEFAULT false,
    "can_switch_companies" boolean DEFAULT true,
    "max_daily_documents" integer,
    "allowed_modules" "text"[],
    "restricted_ips" "inet"[],
    "allowed_hours_start" time without time zone,
    "allowed_hours_end" time without time zone,
    "allowed_days_week" integer[],
    "timezone" character varying(50),
    "created_by_user_id" "uuid",
    "updated_by_user_id" "uuid",
    "last_access_at" timestamp with time zone,
    "access_count" integer DEFAULT 0,
    "notes" "text",
    "custom_fields" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_companies_dates_valid" CHECK ((("end_date" IS NULL) OR ("end_date" >= "start_date"))),
    CONSTRAINT "user_companies_hours_valid" CHECK (((("allowed_hours_start" IS NULL) AND ("allowed_hours_end" IS NULL)) OR (("allowed_hours_start" IS NOT NULL) AND ("allowed_hours_end" IS NOT NULL)))),
    CONSTRAINT "user_companies_invitation_token_with_expiry" CHECK (((("invitation_token" IS NULL) AND ("invitation_expires_at" IS NULL)) OR (("invitation_token" IS NOT NULL) AND ("invitation_expires_at" IS NOT NULL)))),
    CONSTRAINT "user_companies_join_type_valid" CHECK ((("join_type")::"text" = ANY (ARRAY[('invited'::character varying)::"text", ('requested'::character varying)::"text", ('transferred'::character varying)::"text", ('created'::character varying)::"text"]))),
    CONSTRAINT "user_companies_max_documents_positive" CHECK ((("max_daily_documents" IS NULL) OR ("max_daily_documents" > 0))),
    CONSTRAINT "user_companies_status_valid" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('inactive'::character varying)::"text", ('pending'::character varying)::"text", ('suspended'::character varying)::"text"])))
);


ALTER TABLE "public"."user_companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_companies" IS 'Relacionamento many-to-many entre usuários e empresas';



CREATE TABLE IF NOT EXISTS "public"."user_company_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_company_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "is_primary_role" boolean DEFAULT false,
    "assigned_by_user_id" "uuid",
    "assigned_reason" "text",
    "assignment_type" character varying(20) DEFAULT 'manual'::character varying,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "auto_revoke_at" timestamp with time zone,
    "permissions_override" "jsonb",
    "resource_scope" "jsonb",
    "conditions" "jsonb",
    "requires_approval" boolean DEFAULT false,
    "approved_by_user_id" "uuid",
    "approved_at" timestamp with time zone,
    "approval_status" character varying(20) DEFAULT 'approved'::character varying,
    "last_used_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid",
    CONSTRAINT "user_company_roles_approval_status_valid" CHECK ((("approval_status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('approved'::character varying)::"text", ('rejected'::character varying)::"text"]))),
    CONSTRAINT "user_company_roles_assignment_type_valid" CHECK ((("assignment_type")::"text" = ANY (ARRAY[('manual'::character varying)::"text", ('automatic'::character varying)::"text", ('inherited'::character varying)::"text"]))),
    CONSTRAINT "user_company_roles_valid_dates" CHECK ((("valid_until" IS NULL) OR ("valid_until" > "valid_from")))
);


ALTER TABLE "public"."user_company_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_company_roles" IS 'Roles específicos dos usuários em cada empresa';



CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_company_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "is_granted" boolean DEFAULT true,
    "granted_by_user_id" "uuid",
    "granted_reason" "text",
    "conditions" "jsonb",
    "resource_scope" "jsonb",
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_permissions" IS 'Permissões granulares específicas por usuário/empresa';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."companies_onboarding_checklist"
    ADD CONSTRAINT "companies_onboarding_checklist_company_id_checklist_item_id_key" UNIQUE ("company_id", "checklist_item_id");



ALTER TABLE ONLY "public"."companies_onboarding_checklist"
    ADD CONSTRAINT "companies_onboarding_checklist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_company_id_routine_id_key" UNIQUE ("company_id", "routine_id");



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_checklist"
    ADD CONSTRAINT "onboarding_checklist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_profile_id_entity_id_key" UNIQUE ("profile_id", "entity_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_unique_pair" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_executions"
    ADD CONSTRAINT "routine_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_invitation_token_key" UNIQUE ("invitation_token");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_unique_pair" UNIQUE ("user_id", "company_id");



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_unique_assignment" UNIQUE ("user_company_id", "role_id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_unique_pair" UNIQUE ("user_company_id", "permission_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_profile_id_key" UNIQUE ("user_id", "profile_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_companies_cnpj" ON "public"."companies" USING "btree" ("cnpj");



CREATE INDEX "idx_companies_lifecycle_stage" ON "public"."companies" USING "btree" ("lifecycle_stage");



CREATE INDEX "idx_companies_onboarding_checked_at" ON "public"."companies_onboarding_checklist" USING "btree" ("checked_at");



CREATE INDEX "idx_companies_onboarding_checklist_item_id" ON "public"."companies_onboarding_checklist" USING "btree" ("checklist_item_id");



CREATE INDEX "idx_companies_onboarding_company_id" ON "public"."companies_onboarding_checklist" USING "btree" ("company_id");



CREATE INDEX "idx_companies_onboarding_created_at" ON "public"."companies_onboarding_checklist" USING "btree" ("created_at");



CREATE INDEX "idx_companies_onboarding_display_order" ON "public"."companies_onboarding_checklist" USING "btree" ("display_order");



CREATE INDEX "idx_companies_onboarding_enabled_plans" ON "public"."companies_onboarding_checklist" USING "gin" ("enabled_plans");



CREATE INDEX "idx_companies_onboarding_is_checked" ON "public"."companies_onboarding_checklist" USING "btree" ("is_checked");



CREATE INDEX "idx_companies_onboarding_progress" ON "public"."companies" USING "btree" ("onboarding_progress");



CREATE INDEX "idx_companies_onboarding_responsible_department" ON "public"."companies_onboarding_checklist" USING "btree" ("responsible_department");



CREATE INDEX "idx_companies_onboarding_week" ON "public"."companies_onboarding_checklist" USING "btree" ("week");



CREATE INDEX "idx_companies_routines_assigned_to" ON "public"."companies_routines" USING "btree" ("assigned_to");



CREATE INDEX "idx_companies_routines_company_id" ON "public"."companies_routines" USING "btree" ("company_id");



CREATE INDEX "idx_companies_routines_created_at" ON "public"."companies_routines" USING "btree" ("created_at");



CREATE INDEX "idx_companies_routines_is_active" ON "public"."companies_routines" USING "btree" ("is_active");



CREATE INDEX "idx_companies_routines_is_paused" ON "public"."companies_routines" USING "btree" ("is_paused");



CREATE INDEX "idx_companies_routines_last_completed_at" ON "public"."companies_routines" USING "btree" ("last_completed_at");



CREATE INDEX "idx_companies_routines_last_execution" ON "public"."companies_routines" USING "btree" ("last_execution_date");



CREATE INDEX "idx_companies_routines_next_execution" ON "public"."companies_routines" USING "btree" ("next_execution_date");



CREATE INDEX "idx_companies_routines_routine_id" ON "public"."companies_routines" USING "btree" ("routine_id");



CREATE INDEX "idx_companies_routines_start_date" ON "public"."companies_routines" USING "btree" ("start_date");



CREATE INDEX "idx_companies_slug" ON "public"."companies" USING "btree" ("slug");



CREATE INDEX "idx_documents_campos_faltantes" ON "public"."documents" USING "gin" ("campos_faltantes");



CREATE INDEX "idx_documents_categoria" ON "public"."documents" USING "btree" ("categoria");



CREATE INDEX "idx_documents_cliente" ON "public"."documents" USING "btree" ("cliente");



CREATE INDEX "idx_documents_cliente_text" ON "public"."documents" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", ("cliente")::"text"));



CREATE INDEX "idx_documents_cnpj" ON "public"."documents" USING "btree" ("cnpj");



CREATE INDEX "idx_documents_company_id" ON "public"."documents" USING "btree" ("company_id");



CREATE INDEX "idx_documents_dados_completos" ON "public"."documents" USING "btree" ("dados_completos");



CREATE INDEX "idx_documents_data_documento" ON "public"."documents" USING "btree" ("data_documento");



CREATE INDEX "idx_documents_data_upload" ON "public"."documents" USING "btree" ("data_upload");



CREATE INDEX "idx_documents_descricao_text" ON "public"."documents" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "descricao"));



CREATE INDEX "idx_documents_fornecedor" ON "public"."documents" USING "btree" ("fornecedor");



CREATE INDEX "idx_documents_fornecedor_text" ON "public"."documents" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", ("fornecedor")::"text"));



CREATE INDEX "idx_documents_nome_text" ON "public"."documents" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", ("nome")::"text"));



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "idx_documents_tags" ON "public"."documents" USING "gin" ("tags");



CREATE INDEX "idx_documents_tipo_documento" ON "public"."documents" USING "btree" ("tipo_documento");



CREATE INDEX "idx_documents_valor_decimal" ON "public"."documents" USING "btree" ("valor_decimal");



CREATE INDEX "idx_entities_name" ON "public"."entities" USING "btree" ("name");



CREATE INDEX "idx_onboarding_checklist_created_at" ON "public"."onboarding_checklist" USING "btree" ("created_at");



CREATE INDEX "idx_onboarding_checklist_display_order" ON "public"."onboarding_checklist" USING "btree" ("display_order");



CREATE INDEX "idx_onboarding_checklist_enabled_plans" ON "public"."onboarding_checklist" USING "gin" ("enabled_plans");



CREATE INDEX "idx_onboarding_checklist_is_active" ON "public"."onboarding_checklist" USING "btree" ("is_active");



CREATE INDEX "idx_onboarding_checklist_responsible_department" ON "public"."onboarding_checklist" USING "btree" ("responsible_department");



CREATE INDEX "idx_onboarding_checklist_week" ON "public"."onboarding_checklist" USING "btree" ("week");



CREATE INDEX "idx_permissions_entity_id" ON "public"."permissions" USING "btree" ("entity_id");



CREATE INDEX "idx_permissions_profile_id" ON "public"."permissions" USING "btree" ("profile_id");



CREATE INDEX "idx_profiles_company_id" ON "public"."profiles" USING "btree" ("company_id");



CREATE INDEX "idx_profiles_role_id" ON "public"."profiles" USING "btree" ("role_id");



CREATE INDEX "idx_prospects_cnpj" ON "public"."prospects" USING "btree" ("cnpj");



CREATE INDEX "idx_prospects_created_at" ON "public"."prospects" USING "btree" ("created_at");



CREATE INDEX "idx_prospects_email_contato" ON "public"."prospects" USING "btree" ("email_contato");



CREATE INDEX "idx_prospects_plano" ON "public"."prospects" USING "btree" ("plano");



CREATE INDEX "idx_prospects_status" ON "public"."prospects" USING "btree" ("status");



CREATE INDEX "idx_role_permissions_expires_at" ON "public"."role_permissions" USING "btree" ("expires_at");



CREATE INDEX "idx_role_permissions_is_granted" ON "public"."role_permissions" USING "btree" ("is_granted");



CREATE INDEX "idx_role_permissions_permission_id" ON "public"."role_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_role_permissions_role_id" ON "public"."role_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_routine_executions_company_routine_id" ON "public"."routine_executions" USING "btree" ("company_routine_id");



CREATE INDEX "idx_routine_executions_created_at" ON "public"."routine_executions" USING "btree" ("created_at");



CREATE INDEX "idx_routine_executions_executed_at" ON "public"."routine_executions" USING "btree" ("executed_at");



CREATE INDEX "idx_routine_executions_executed_by" ON "public"."routine_executions" USING "btree" ("executed_by");



CREATE INDEX "idx_routine_executions_next_execution_date" ON "public"."routine_executions" USING "btree" ("next_execution_date");



CREATE INDEX "idx_routine_executions_status" ON "public"."routine_executions" USING "btree" ("status");



CREATE INDEX "idx_routines_category" ON "public"."routines" USING "btree" ("category");



CREATE INDEX "idx_routines_created_at" ON "public"."routines" USING "btree" ("created_at");



CREATE INDEX "idx_routines_frequency" ON "public"."routines" USING "btree" ("frequency");



CREATE INDEX "idx_routines_is_active" ON "public"."routines" USING "btree" ("is_active");



CREATE INDEX "idx_routines_is_template" ON "public"."routines" USING "btree" ("is_template");



CREATE INDEX "idx_routines_name" ON "public"."routines" USING "btree" ("name");



CREATE INDEX "idx_routines_priority" ON "public"."routines" USING "btree" ("priority");



CREATE INDEX "idx_subscriptions_company_id" ON "public"."subscriptions" USING "btree" ("company_id");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_user_companies_company_id" ON "public"."user_companies" USING "btree" ("company_id");



CREATE INDEX "idx_user_companies_invitation_token" ON "public"."user_companies" USING "btree" ("invitation_token");



CREATE INDEX "idx_user_companies_is_primary" ON "public"."user_companies" USING "btree" ("is_primary_company");



CREATE INDEX "idx_user_companies_status" ON "public"."user_companies" USING "btree" ("status");



CREATE INDEX "idx_user_companies_user_id" ON "public"."user_companies" USING "btree" ("user_id");



CREATE INDEX "idx_user_company_roles_active_permissions" ON "public"."user_company_roles" USING "btree" ("user_id", "company_id", "is_active") WHERE (("is_active" = true) AND (("approval_status")::"text" = 'approved'::"text"));



CREATE INDEX "idx_user_company_roles_approval_status" ON "public"."user_company_roles" USING "btree" ("approval_status");



CREATE INDEX "idx_user_company_roles_company_id" ON "public"."user_company_roles" USING "btree" ("company_id");



CREATE INDEX "idx_user_company_roles_is_active" ON "public"."user_company_roles" USING "btree" ("is_active");



CREATE INDEX "idx_user_company_roles_is_primary" ON "public"."user_company_roles" USING "btree" ("is_primary_role");



CREATE INDEX "idx_user_company_roles_profile_id" ON "public"."user_company_roles" USING "btree" ("profile_id");



CREATE INDEX "idx_user_company_roles_role_id" ON "public"."user_company_roles" USING "btree" ("role_id");



CREATE INDEX "idx_user_company_roles_user_company" ON "public"."user_company_roles" USING "btree" ("user_company_id");



CREATE INDEX "idx_user_company_roles_user_id" ON "public"."user_company_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_company_roles_valid_until" ON "public"."user_company_roles" USING "btree" ("valid_until");



CREATE INDEX "idx_user_permissions_company_id" ON "public"."user_permissions" USING "btree" ("company_id");



CREATE INDEX "idx_user_permissions_is_granted" ON "public"."user_permissions" USING "btree" ("is_granted");



CREATE INDEX "idx_user_permissions_permission_id" ON "public"."user_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_user_permissions_user_company" ON "public"."user_permissions" USING "btree" ("user_company_id");



CREATE INDEX "idx_user_permissions_user_id" ON "public"."user_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_profile_id" ON "public"."user_profiles" USING "btree" ("profile_id");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_is_verified" ON "public"."users" USING "btree" ("is_verified");



CREATE INDEX "idx_users_role_id" ON "public"."users" USING "btree" ("role_id");



CREATE INDEX "idx_users_verification_level" ON "public"."users" USING "btree" ("verification_level");



CREATE OR REPLACE TRIGGER "role_permissions_updated_at_trigger" BEFORE UPDATE ON "public"."role_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_role_permissions_updated_at"();



CREATE OR REPLACE TRIGGER "user_companies_updated_at_trigger" BEFORE UPDATE ON "public"."user_companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_companies_updated_at"();



CREATE OR REPLACE TRIGGER "user_company_roles_single_primary_trigger" BEFORE INSERT OR UPDATE OF "is_primary_role" ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_primary_role"();



CREATE OR REPLACE TRIGGER "user_company_roles_sync_cache_trigger" BEFORE INSERT OR UPDATE OF "user_company_id" ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_company_roles_cache"();



CREATE OR REPLACE TRIGGER "user_company_roles_updated_at_trigger" BEFORE UPDATE ON "public"."user_company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_company_roles_updated_at"();



CREATE OR REPLACE TRIGGER "user_permissions_sync_cache_trigger" BEFORE INSERT OR UPDATE OF "user_company_id" ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_permissions_cache"();



CREATE OR REPLACE TRIGGER "user_permissions_updated_at_trigger" BEFORE UPDATE ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_permissions_updated_at"();



ALTER TABLE ONLY "public"."companies_onboarding_checklist"
    ADD CONSTRAINT "companies_onboarding_checklist_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."companies_onboarding_checklist"
    ADD CONSTRAINT "companies_onboarding_checklist_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."onboarding_checklist"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies_onboarding_checklist"
    ADD CONSTRAINT "companies_onboarding_checklist_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_last_completed_by_fkey" FOREIGN KEY ("last_completed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."companies_routines"
    ADD CONSTRAINT "companies_routines_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."routine_executions"
    ADD CONSTRAINT "routine_executions_company_routine_id_fkey" FOREIGN KEY ("company_routine_id") REFERENCES "public"."companies_routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_executions"
    ADD CONSTRAINT "routine_executions_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_company_roles"
    ADD CONSTRAINT "user_company_roles_user_company_id_fkey" FOREIGN KEY ("user_company_id") REFERENCES "public"."user_companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_company_id_fkey" FOREIGN KEY ("user_company_id") REFERENCES "public"."user_companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_delete" ON "public"."role_permissions" FOR DELETE USING ("public"."user_is_bpo_super_admin"());



CREATE POLICY "role_permissions_insert" ON "public"."role_permissions" FOR INSERT WITH CHECK ("public"."user_is_bpo_super_admin"());



CREATE POLICY "role_permissions_select" ON "public"."role_permissions" FOR SELECT USING (true);



CREATE POLICY "role_permissions_update" ON "public"."role_permissions" FOR UPDATE USING ("public"."user_is_bpo_super_admin"());



ALTER TABLE "public"."user_companies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_companies_delete" ON "public"."user_companies" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_companies_insert" ON "public"."user_companies" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_companies_select" ON "public"."user_companies" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_companies_update" ON "public"."user_companies" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



ALTER TABLE "public"."user_company_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_company_roles_delete" ON "public"."user_company_roles" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_company_roles_insert" ON "public"."user_company_roles" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_company_roles_select" ON "public"."user_company_roles" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_company_roles_update" ON "public"."user_company_roles" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_permissions_delete" ON "public"."user_permissions" FOR DELETE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_permissions_insert" ON "public"."user_permissions" FOR INSERT WITH CHECK (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



CREATE POLICY "user_permissions_select" ON "public"."user_permissions" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."user_is_bpo"() OR "public"."user_has_company_access"("company_id")));



CREATE POLICY "user_permissions_update" ON "public"."user_permissions" FOR UPDATE USING (("public"."user_is_bpo"() OR "public"."user_is_company_admin"("company_id")));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."cleanup_user_data"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_user_data"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_user_data"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_auth_user_direct"("user_id" "uuid", "email" "text", "password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_auth_user_direct"("user_id" "uuid", "email" "text", "password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_auth_user_direct"("user_id" "uuid", "email" "text", "password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_signup"("p_user_id" "uuid", "p_prospect_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying, "p_notes" "text", "p_attachments" "text"[], "p_time_spent_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying, "p_notes" "text", "p_attachments" "text"[], "p_time_spent_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."execute_routine"("p_company_routine_id" "uuid", "p_executed_by" "uuid", "p_status" character varying, "p_notes" "text", "p_attachments" "text"[], "p_time_spent_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "anon";
GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_user_names"() TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_company_onboarding_checklist"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_company_routines"("p_company_id" "uuid", "p_subscription_plan" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_company_roles_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_permissions_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_jwt_hook_for_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."test_jwt_hook_for_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_jwt_hook_for_user"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_companies_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_onboarding_progress"("p_company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_role_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_companies_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_company_roles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_permissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_company_access"("company_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_bpo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_bpo_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_company_admin"("company_uuid" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";
GRANT SELECT ON TABLE "public"."companies" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."companies_onboarding_checklist" TO "anon";
GRANT ALL ON TABLE "public"."companies_onboarding_checklist" TO "authenticated";
GRANT ALL ON TABLE "public"."companies_onboarding_checklist" TO "service_role";



GRANT ALL ON TABLE "public"."companies_routines" TO "anon";
GRANT ALL ON TABLE "public"."companies_routines" TO "authenticated";
GRANT ALL ON TABLE "public"."companies_routines" TO "service_role";



GRANT ALL ON TABLE "public"."routine_executions" TO "anon";
GRANT ALL ON TABLE "public"."routine_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_executions" TO "service_role";



GRANT ALL ON TABLE "public"."routines" TO "anon";
GRANT ALL ON TABLE "public"."routines" TO "authenticated";
GRANT ALL ON TABLE "public"."routines" TO "service_role";



GRANT ALL ON TABLE "public"."companies_routines_summary" TO "anon";
GRANT ALL ON TABLE "public"."companies_routines_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."companies_routines_summary" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT SELECT ON TABLE "public"."users" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."company_routines_details" TO "anon";
GRANT ALL ON TABLE "public"."company_routines_details" TO "authenticated";
GRANT ALL ON TABLE "public"."company_routines_details" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."entities" TO "anon";
GRANT ALL ON TABLE "public"."entities" TO "authenticated";
GRANT ALL ON TABLE "public"."entities" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_checklist" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_checklist" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_checklist" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";
GRANT SELECT ON TABLE "public"."subscriptions" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."onboarding_companies_unified" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_companies_unified" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_companies_unified" TO "service_role";



GRANT ALL ON TABLE "public"."operational_health_score" TO "anon";
GRANT ALL ON TABLE "public"."operational_health_score" TO "authenticated";
GRANT ALL ON TABLE "public"."operational_health_score" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."prospects" TO "anon";
GRANT ALL ON TABLE "public"."prospects" TO "authenticated";
GRANT ALL ON TABLE "public"."prospects" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
GRANT SELECT ON TABLE "public"."roles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."user_companies" TO "anon";
GRANT ALL ON TABLE "public"."user_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_companies" TO "service_role";



GRANT ALL ON TABLE "public"."user_company_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_company_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_company_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_profiles" TO "supabase_auth_admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
