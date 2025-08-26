-- ======================================
-- ElevaLucro BPO - Complete Schema Setup
-- ======================================

-- Drop existing tables to recreate clean
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj VARCHAR(18) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);

-- 2. Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('bpo_side', 'client_side'))
);

-- Insert basic roles
INSERT INTO roles (name) VALUES ('bpo_side'), ('client_side');

-- 3. Profiles  
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);

-- Insert basic profiles
INSERT INTO profiles (name, role_id) 
SELECT 'Admin Cliente', id FROM roles WHERE name = 'client_side';
INSERT INTO profiles (name, role_id)
SELECT 'Admin BPO', id FROM roles WHERE name = 'bpo_side';

-- 4. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role_id UUID REFERENCES roles(id),
  profile_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- 5. Entities
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);
CREATE INDEX idx_entities_name ON entities(name);

-- Insert basic entities
INSERT INTO entities (name, description) VALUES 
('prospects', 'Gerenciar prospects'),
('companies', 'Gerenciar empresas'),
('users', 'Gerenciar usuários');

-- 6. Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, entity_id)
);
CREATE INDEX idx_permissions_profile_id ON permissions(profile_id);
CREATE INDEX idx_permissions_entity_id ON permissions(entity_id);

-- 7. User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, profile_id)
);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_profile_id ON user_profiles(profile_id);

-- 8. Prospects
CREATE TABLE prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados pessoais do contato
    nome_contato VARCHAR(100) NOT NULL,
    cpf_contato VARCHAR(14) NOT NULL,
    email_contato VARCHAR(255) NOT NULL,
    telefone_contato VARCHAR(20),
    cargo_contato VARCHAR(100),
    
    -- Dados da empresa
    nome_empresa VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cep VARCHAR(9),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Dados técnicos/operacionais
    segmento VARCHAR(100),
    areas TEXT[],
    bancos TEXT[],
    ferramentas TEXT[],
    fornecedores TEXT[],
    organizacao TEXT[],
    relatorios TEXT[],
    
    -- Expectativas e objetivos
    expectativas_sucesso TEXT,
    
    -- Plano selecionado
    plano VARCHAR(20) NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    
    -- Status do prospect
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Metadados
    origem VARCHAR(50),
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_prospects_email_contato ON prospects(email_contato);
CREATE INDEX idx_prospects_cnpj ON prospects(cnpj);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_plano ON prospects(plano);
CREATE INDEX idx_prospects_created_at ON prospects(created_at);

-- 9. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('controle', 'gerencial', 'avancado')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ======================================
-- Database Function for Client Signup
-- ======================================
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
    v_user_record_id UUID;
    v_subscription_id UUID;
    v_result JSONB;
BEGIN
    BEGIN
        -- Get client_side role ID
        SELECT id INTO v_client_role_id
        FROM roles
        WHERE name = 'client_side'
        LIMIT 1;
        
        IF v_client_role_id IS NULL THEN
            RAISE EXCEPTION 'Role "client_side" não encontrada na tabela roles.';
        END IF;

        -- Create company
        INSERT INTO companies (name, slug, cnpj)
        VALUES (
            p_prospect_data->>'nome_empresa',
            lower(replace(replace(p_prospect_data->>'nome_empresa', ' ', '-'), '.', '')),
            p_prospect_data->>'cnpj'
        )
        RETURNING id INTO v_company_id;

        -- Create profile
        INSERT INTO profiles (name, role_id, company_id)
        VALUES (
            'Admin',
            v_client_role_id,
            v_company_id
        )
        RETURNING id INTO v_profile_id;

        -- Create user record
        INSERT INTO users (id, email, full_name, phone, role_id, profile_id)
        VALUES (
            p_user_id,
            p_prospect_data->>'email_contato',
            p_prospect_data->>'nome_contato',
            p_prospect_data->>'telefone_contato',
            v_client_role_id,
            v_profile_id
        )
        RETURNING id INTO v_user_record_id;

        -- Create user_profile relationship
        INSERT INTO user_profiles (user_id, profile_id)
        VALUES (v_user_record_id, v_profile_id);

        -- Create subscription
        INSERT INTO subscriptions (company_id, plan_type)
        VALUES (
            v_company_id,
            CASE 
                WHEN p_prospect_data->>'plano' = 'controle' THEN 'controle'
                WHEN p_prospect_data->>'plano' = 'gerencial' THEN 'gerencial'
                WHEN p_prospect_data->>'plano' = 'avancado' THEN 'avancado'
                ELSE 'controle'
            END
        )
        RETURNING id INTO v_subscription_id;

        -- Create permissions for all entities
        INSERT INTO permissions (profile_id, entity_id, can_read, can_create, can_update, can_delete)
        SELECT 
            v_profile_id,
            id,
            true,
            true,
            true,
            false
        FROM entities;

        -- Build success result
        v_result := jsonb_build_object(
            'success', true,
            'company_id', v_company_id,
            'profile_id', v_profile_id,
            'user_id', v_user_record_id,
            'subscription_id', v_subscription_id
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Return error
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro durante criação do cliente: ' || SQLERRM
        );
    END;
END;
$$;