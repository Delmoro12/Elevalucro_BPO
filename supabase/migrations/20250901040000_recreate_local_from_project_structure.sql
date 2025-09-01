-- =============================================================================
-- Recreate Local Database from Project Structure
-- =============================================================================
-- This migration recreates the local database to match exactly the project
-- structure based on schemas/, views/, and procedures/ folders

-- =============================================================================
-- 1. DROP EVERYTHING (Clean Slate)
-- =============================================================================

-- Drop all views first (dependencies)
DROP VIEW IF EXISTS onboarding_companies_unified CASCADE;
DROP VIEW IF EXISTS companies_routines_summary CASCADE;
DROP VIEW IF EXISTS company_routines_details CASCADE;
DROP VIEW IF EXISTS operational_health_score CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS create_client_signup CASCADE;
DROP FUNCTION IF EXISTS custom_access_token_hook CASCADE;
DROP FUNCTION IF EXISTS setup_company_onboarding_checklist CASCADE;
DROP FUNCTION IF EXISTS setup_company_routines CASCADE;
DROP FUNCTION IF EXISTS update_onboarding_progress CASCADE;
DROP FUNCTION IF EXISTS execute_routine CASCADE;
DROP FUNCTION IF EXISTS extract_user_names CASCADE;

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS user_company_roles CASCADE;
DROP TABLE IF EXISTS user_companies CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS routine_executions CASCADE;
DROP TABLE IF EXISTS companies_routines CASCADE;
DROP TABLE IF EXISTS companies_onboarding_checklist CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS onboarding_checklist CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- =============================================================================
-- 2. CREATE TABLES (from schemas folder in dependency order)
-- =============================================================================

-- Create roles first (no dependencies)
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL CHECK (name = ANY(ARRAY['bpo_side'::text, 'client_side'::text]))
);

-- Create companies (no dependencies)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cnpj CHARACTER VARYING(18),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    subscription_plan CHARACTER VARYING(50) DEFAULT 'controle'::character varying,
    lifecycle_stage CHARACTER VARYING(20) DEFAULT 'onboarding'::character varying,
    onboarding_progress INTEGER DEFAULT 0,
    email CHARACTER VARYING(255),
    phone CHARACTER VARYING(20),
    segmento CHARACTER VARYING(100)
);

-- Create permissions (no dependencies)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles (depends on companies)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create users (depends on roles, profiles)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    profile_id UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'none',
    terms_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    marketing_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Continue with remaining tables
CREATE TABLE IF NOT EXISTS entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    email_contato VARCHAR(255),
    nome_contato VARCHAR(255),
    telefone_contato VARCHAR(20),
    cpf_contato VARCHAR(14),
    cnpj VARCHAR(18),
    plano VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    valor_mensal DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    week INTEGER,
    display_order INTEGER DEFAULT 0,
    enabled_plans TEXT[] DEFAULT ARRAY['controle'::text, 'gerencial'::text, 'avancado'::text],
    responsible_department TEXT DEFAULT 'Customer Success'::text,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category CHARACTER VARYING(50),
    frequency CHARACTER VARYING(20),
    priority CHARACTER VARYING(20) DEFAULT 'medium'::character varying,
    estimated_hours NUMERIC(5,2),
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    instructions TEXT,
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies_routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    routine_id UUID NOT NULL REFERENCES routines(id),
    custom_name TEXT,
    custom_description TEXT,
    custom_instructions TEXT,
    custom_frequency CHARACTER VARYING(20),
    custom_priority CHARACTER VARYING(20),
    assigned_to UUID,
    assigned_team CHARACTER VARYING(100),
    start_date DATE,
    end_date DATE,
    day_of_week INTEGER,
    day_of_month INTEGER,
    month_of_year INTEGER,
    last_completed_at TIMESTAMPTZ,
    last_completed_by UUID,
    completion_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    pause_reason TEXT,
    notify_before_hours INTEGER DEFAULT 24,
    notify_on_overdue BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    next_execution_date TIMESTAMPTZ,
    last_execution_date TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(company_id, routine_id)
);

CREATE TABLE IF NOT EXISTS companies_onboarding_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    checklist_item_id UUID NOT NULL REFERENCES onboarding_checklist(id),
    is_checked BOOLEAN DEFAULT false,
    checked_at TIMESTAMPTZ,
    checked_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    observacoes TEXT,
    title TEXT,
    description TEXT,
    week INTEGER,
    display_order INTEGER DEFAULT 0,
    enabled_plans TEXT[] DEFAULT ARRAY['controle'::text, 'gerencial'::text, 'avancado'::text],
    responsible_department TEXT DEFAULT 'Customer Success'::text,
    UNIQUE(company_id, checklist_item_id)
);

-- Additional tables from production
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    is_granted BOOLEAN DEFAULT true,
    is_inherited BOOLEAN DEFAULT false,
    inherited_from_role_id UUID,
    conditions JSONB,
    resource_restrictions JSONB,
    expires_at TIMESTAMPTZ,
    is_temporary BOOLEAN DEFAULT false,
    granted_by_user_id UUID,
    granted_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_routine_id UUID NOT NULL REFERENCES companies_routines(id),
    executed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    executed_by UUID REFERENCES users(id),
    status CHARACTER VARYING(20) DEFAULT 'completed'::character varying,
    notes TEXT,
    attachments TEXT[],
    time_spent_minutes INTEGER,
    next_execution_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    join_type CHARACTER VARYING(20) DEFAULT 'invited'::character varying,
    invited_by_user_id UUID,
    invited_at TIMESTAMPTZ,
    invitation_token CHARACTER VARYING(255),
    invitation_expires_at TIMESTAMPTZ,
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    display_name CHARACTER VARYING(100),
    department CHARACTER VARYING(100),
    employee_id CHARACTER VARYING(50),
    start_date DATE,
    end_date DATE,
    is_primary_company BOOLEAN DEFAULT false,
    default_login_company BOOLEAN DEFAULT false,
    can_switch_companies BOOLEAN DEFAULT true,
    max_daily_documents INTEGER,
    allowed_modules TEXT[],
    restricted_ips INET[],
    allowed_hours_start TIME WITHOUT TIME ZONE,
    allowed_hours_end TIME WITHOUT TIME ZONE,
    allowed_days_week INTEGER[],
    timezone CHARACTER VARYING(50),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    last_access_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    notes TEXT,
    custom_fields JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_company_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_company_id UUID NOT NULL REFERENCES user_companies(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    is_active BOOLEAN DEFAULT true,
    is_primary_role BOOLEAN DEFAULT false,
    assigned_by_user_id UUID,
    assigned_reason TEXT,
    assignment_type CHARACTER VARYING(20) DEFAULT 'manual'::character varying,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    auto_revoke_at TIMESTAMPTZ,
    permissions_override JSONB,
    resource_scope JSONB,
    conditions JSONB,
    requires_approval BOOLEAN DEFAULT false,
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    approval_status CHARACTER VARYING(20) DEFAULT 'approved'::character varying,
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    profile_id UUID
);

CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_company_id UUID NOT NULL REFERENCES user_companies(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    is_granted BOOLEAN DEFAULT true,
    granted_by_user_id UUID,
    granted_reason TEXT,
    conditions JSONB,
    resource_scope JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_lifecycle_stage ON companies(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_checklist_company_id ON companies_onboarding_checklist(company_id);

-- =============================================================================
-- 4. CREATE VIEWS (from views folder)
-- =============================================================================

-- companies_routines_summary view
CREATE VIEW companies_routines_summary AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  c.email as email,
  c.phone as telefone,
  c.segmento as segmento,
  c.subscription_plan as plano,
  c.lifecycle_stage,
  c.created_at,
  COUNT(cr.routine_id) as total_rotinas,
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = true) as rotinas_ativas,
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = false) as rotinas_inativas,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'daily') as rotinas_diarias,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'weekly') as rotinas_semanais,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'monthly') as rotinas_mensais,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'quarterly') as rotinas_trimestrais
FROM companies c
LEFT JOIN companies_routines cr ON c.id = cr.company_id
LEFT JOIN routines r ON cr.routine_id = r.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.email, c.phone, c.segmento, c.subscription_plan, c.lifecycle_stage, c.created_at
ORDER BY c.created_at ASC;

-- company_routines_details view
CREATE VIEW company_routines_details AS
SELECT 
  cr.*,
  r.name as routine_name,
  r.description as routine_description,
  r.category as routine_category,
  r.frequency as routine_frequency,
  r.priority as routine_priority,
  r.estimated_hours as routine_estimated_hours,
  r.instructions as routine_instructions,
  c.name as company_name
FROM companies_routines cr
JOIN routines r ON cr.routine_id = r.id
JOIN companies c ON cr.company_id = c.id
WHERE c.is_active = true;

-- operational_health_score view  
CREATE VIEW operational_health_score AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(cr.id) as total_routines,
  COUNT(CASE WHEN cr.is_active THEN 1 END) as active_routines,
  COUNT(re.id) as total_executions,
  COUNT(CASE WHEN re.status = 'completed' THEN 1 END) as completed_executions
FROM companies c
LEFT JOIN companies_routines cr ON c.id = cr.company_id
LEFT JOIN routine_executions re ON cr.id = re.company_routine_id
WHERE c.is_active = true
GROUP BY c.id, c.name;

-- onboarding_companies_unified view
CREATE VIEW onboarding_companies_unified AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  c.email as email,
  c.phone as telefone,  
  c.segmento as segmento,
  c.subscription_plan as plano,
  c.onboarding_progress as progresso_onboarding,
  c.lifecycle_stage,
  c.created_at as data_inicio,
  
  -- Calcular semana de onboarding baseada em dias desde criação
  CASE 
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
    ELSE 'semana_4'
  END as semana_onboarding,
  
  -- Dias desde criação
  EXTRACT(DAYS FROM (NOW() - c.created_at)) as dias_desde_criacao,
  
  -- Checklist items completo (para modal)
  CASE 
    WHEN COUNT(coc.id) = 0 THEN '[]'::json
    ELSE json_agg(
      json_build_object(
        'id', coc.checklist_item_id,
        'title', coc.title,
        'description', coc.description,
        'week', coc.week,
        'display_order', coc.display_order,
        'enabled_plans', coc.enabled_plans,
        'responsible_department', coc.responsible_department,
        'is_checked', coc.is_checked,
        'checked_at', coc.checked_at,
        'checked_by', u.full_name,
        'notes', coc.notes
      )
      ORDER BY coc.week ASC, coc.display_order ASC
    )
  END as checklist_items,
  
  -- Contadores gerais
  COUNT(coc.id) as total_checklist_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = false) as pending_items,
  
  -- Estatísticas por semana
  COUNT(coc.id) FILTER (WHERE coc.week = 1) as semana_1_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 1 AND coc.is_checked = true) as semana_1_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 2) as semana_2_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 2 AND coc.is_checked = true) as semana_2_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 3) as semana_3_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 3 AND coc.is_checked = true) as semana_3_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 4) as semana_4_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 4 AND coc.is_checked = true) as semana_4_completed,
  
  -- Próxima ação
  (
    SELECT coc_next.title
    FROM companies_onboarding_checklist coc_next
    WHERE coc_next.company_id = c.id 
    AND coc_next.is_checked = false
    ORDER BY coc_next.week ASC, coc_next.display_order ASC
    LIMIT 1
  ) as proxima_acao,
  
  -- Informações do plano/assinatura
  s.status as subscription_status,
  CASE 
    WHEN c.subscription_plan = 'controle' THEN 950.00
    WHEN c.subscription_plan = 'gerencial' THEN 1300.00
    WHEN c.subscription_plan = 'avancado' THEN 1700.00
    ELSE 0.00
  END as valor_mensal,
  
  -- Responsável padrão
  CASE 
    WHEN c.subscription_plan = 'avancado' THEN 'Consultor Sênior'
    WHEN c.subscription_plan = 'gerencial' THEN 'Consultor Pleno'
    ELSE 'Consultor Junior'
  END as responsavel

FROM companies c
LEFT JOIN companies_onboarding_checklist coc ON c.id = coc.company_id
LEFT JOIN users u ON coc.checked_by = u.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'
GROUP BY 
  c.id, c.name, c.email, c.phone, c.segmento, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;

-- =============================================================================
-- 5. CREATE FUNCTIONS (from procedures folder)
-- =============================================================================

-- JWT Access Token Hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
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

-- Grant necessary permissions to supabase_auth_admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.user_profiles TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.companies TO supabase_auth_admin;
GRANT SELECT ON public.subscriptions TO supabase_auth_admin;

-- =============================================================================
-- COMPLETE! Local database now matches project structure
-- =============================================================================