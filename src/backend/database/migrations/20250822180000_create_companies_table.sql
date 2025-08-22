-- Migration: Create companies table
-- Description: Tabela de empresas/organizações para sistema multi-tenant

-- Tabela de empresas/organizações
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados básicos da empresa
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- Para URLs amigáveis
    description TEXT,
    
    -- Dados corporativos
    cnpj VARCHAR(18) UNIQUE, -- CNPJ formatado XX.XXX.XXX/XXXX-XX
    cnpj_raw VARCHAR(14) UNIQUE, -- CNPJ apenas números
    ie VARCHAR(20), -- Inscrição Estadual
    im VARCHAR(20), -- Inscrição Municipal
    
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
    
    -- Configurações
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#10b981', -- Cor primária da marca
    secondary_color VARCHAR(7) DEFAULT '#059669',
    
    -- Status e configurações
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    subscription_status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled
    trial_ends_at TIMESTAMPTZ,
    
    -- Limites por plano
    max_users INTEGER DEFAULT 3, -- Limite de usuários
    max_documents_per_month INTEGER DEFAULT 100, -- Limite de documentos processados
    max_storage_gb INTEGER DEFAULT 1, -- Limite de armazenamento em GB
    
    -- Uso atual (reset mensalmente)
    current_documents_count INTEGER DEFAULT 0,
    current_storage_mb INTEGER DEFAULT 0,
    usage_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', now() + interval '1 month'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT companies_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT companies_cnpj_format CHECK (cnpj_raw ~ '^[0-9]{14}$'),
    CONSTRAINT companies_max_users_positive CHECK (max_users > 0),
    CONSTRAINT companies_subscription_plan_valid CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
    CONSTRAINT companies_subscription_status_valid CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj_raw ON companies(cnpj_raw);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_plan ON companies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at_trigger
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- Comentários para documentação
COMMENT ON TABLE companies IS 'Tabela de empresas/organizações do sistema multi-tenant';
COMMENT ON COLUMN companies.slug IS 'Slug único para URLs amigáveis (ex: empresa-abc)';
COMMENT ON COLUMN companies.cnpj_raw IS 'CNPJ apenas números para consultas e validações';
COMMENT ON COLUMN companies.max_users IS 'Limite de usuários baseado no plano de assinatura';
COMMENT ON COLUMN companies.current_documents_count IS 'Contador de documentos processados no mês atual';
COMMENT ON COLUMN companies.usage_reset_at IS 'Data do próximo reset dos contadores de uso';