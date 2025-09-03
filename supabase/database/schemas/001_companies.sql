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
    
    -- Segmento de negócio
    segmento VARCHAR(100),
    
    -- Status e configurações
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'controle' CHECK (subscription_plan IN ('controle', 'gerencial', 'avancado')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    lifecycle_stage VARCHAR(20) DEFAULT 'onboarding' CHECK (lifecycle_stage IN ('onboarding', 'production')),
    
    -- Progresso de onboarding
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj_raw ON companies(cnpj_raw);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_plan ON companies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_progress ON companies(onboarding_progress);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Comentários para as novas colunas
COMMENT ON COLUMN companies.segmento IS 'Business segment or industry of the company';
COMMENT ON COLUMN companies.onboarding_progress IS 'Onboarding progress percentage (0-100)';