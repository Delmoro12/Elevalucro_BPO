-- =============================================================================
-- Migration: Esquema Completo - 8 Tabelas Base
-- Generated at: 2025-09-13 08:02:59
-- =============================================================================

BEGIN;

-- 1. ROLES (sem dependências)
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (name IN ('bpo_side', 'client_side')),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- 2. ENTITIES (sem dependências)
CREATE TABLE IF NOT EXISTS entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);

-- 3. PROSPECTS (sem dependências)
CREATE TABLE IF NOT EXISTS prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados pessoais do contato
    contact_name VARCHAR(100) NOT NULL,
    contact_cpf VARCHAR(14) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_role VARCHAR(100),
    
    -- Dados da empresa
    company_name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    address VARCHAR(255),
    number VARCHAR(20),
    neighborhood VARCHAR(100),
    zip_code VARCHAR(9),
    city VARCHAR(100),
    state VARCHAR(2),
    
    -- Dados técnicos/operacionais
    segment VARCHAR(100),
    areas TEXT[],
    banks TEXT[],
    banks_other TEXT,
    tools TEXT[],
    tools_other TEXT,
    suppliers TEXT[],
    organization TEXT[],
    reports TEXT[],
    
    -- Expectativas e objetivos
    success_expectations TEXT,
    
    -- Plano selecionado
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('controle', 'gerencial', 'avancado')),
    monthly_value DECIMAL(10,2) NOT NULL,
    
    -- Status do prospect
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Metadados
    source VARCHAR(100),
    notes TEXT,
    contact_date DATE,
    proposal_date DATE,
    closing_date DATE,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_plan ON prospects(plan);
CREATE INDEX IF NOT EXISTS idx_prospects_contact_email ON prospects(contact_email);
CREATE INDEX IF NOT EXISTS idx_prospects_cnpj ON prospects(cnpj);

-- 4. ROUTINES (sem dependências)
CREATE TABLE IF NOT EXISTS routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    is_template BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routines_is_template ON routines(is_template);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);

COMMENT ON TABLE routines IS 'Template routines that can be assigned to companies';
COMMENT ON COLUMN routines.name IS 'Name of the routine template';
COMMENT ON COLUMN routines.description IS 'Description of what this routine accomplishes';
COMMENT ON COLUMN routines.instructions IS 'Detailed instructions for executing this routine';
COMMENT ON COLUMN routines.is_template IS 'Whether this is a template routine that can be assigned to companies';

-- 5. COMPANIES (sem dependências - precisa ser criada antes de users devido à referência circular)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados básicos da empresa
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Dados corporativos
    cnpj VARCHAR(18) UNIQUE,
    cnpj_raw VARCHAR(14) UNIQUE,
    ie VARCHAR(20),
    im VARCHAR(20),
    
    -- Endereço
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(9),
    address_country VARCHAR(50) DEFAULT 'Brasil',
    
    -- Contato
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Segmento de negócio
    segment VARCHAR(100),
    
    -- Status e configurações
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'controle' CHECK (subscription_plan IN ('controle', 'gerencial', 'avancado')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    lifecycle_stage VARCHAR(20) DEFAULT 'onboarding' CHECK (lifecycle_stage IN ('onboarding', 'production')),
    
    -- Progresso de onboarding
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    
    -- Limites por plano
    max_users INTEGER DEFAULT 3,
    max_documents_per_month INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 1,
    
    -- Uso atual (reset mensalmente)
    current_documents_count INTEGER DEFAULT 0,
    current_storage_mb INTEGER DEFAULT 0,
    usage_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', now() + interval '1 month'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj_raw ON companies(cnpj_raw);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_plan ON companies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_progress ON companies(onboarding_progress);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- 6. USERS (depende de roles e companies, mas não das FKs circulares ainda)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Relacionamentos (serão adicionados depois devido à referência circular)
    role_id UUID NOT NULL REFERENCES roles(id),
    company_id UUID REFERENCES companies(id),
    
    -- Status e verificação
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'none',
    
    -- Termos e políticas
    terms_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    marketing_consent_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 7. PROFILES (depende de roles, companies e users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- 8. PERMISSIONS (depende de profiles e entities)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    UNIQUE(profile_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_profile_id ON permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_permissions_entity_id ON permissions(entity_id);

-- Agora adicionar as FKs circulares que não puderam ser criadas antes
-- Companies -> Users (para bpo_operator_id e analyst_bpo_id)
ALTER TABLE companies ADD COLUMN bpo_operator_id UUID REFERENCES users(id);
ALTER TABLE companies ADD COLUMN analyst_bpo_id UUID REFERENCES users(id);

-- Users -> Profiles (para profile_id)
ALTER TABLE users ADD COLUMN profile_id UUID REFERENCES profiles(id);

-- Criar índices para as novas FKs
CREATE INDEX IF NOT EXISTS idx_companies_bpo_operator_id ON companies(bpo_operator_id);
CREATE INDEX IF NOT EXISTS idx_companies_analyst_bpo_id ON companies(analyst_bpo_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);

-- Comentários
COMMENT ON COLUMN companies.segment IS 'Business segment or industry of the company';
COMMENT ON COLUMN companies.bpo_operator_id IS 'ID do operador BPO responsável pela empresa';
COMMENT ON COLUMN companies.analyst_bpo_id IS 'ID do analista BPO responsável pela empresa';
COMMENT ON COLUMN companies.onboarding_progress IS 'Onboarding progress percentage (0-100)';

COMMIT;