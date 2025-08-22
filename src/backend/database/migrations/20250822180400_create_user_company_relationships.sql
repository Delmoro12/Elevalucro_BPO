-- Migration: Create user-company relationship tables
-- Description: Tabelas para relacionamentos multi-empresa entre usuários e empresas

-- Tabela de relacionamento entre roles e permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    -- Configurações específicas da atribuição
    is_granted BOOLEAN DEFAULT true, -- true = concede, false = revoga explicitamente
    is_inherited BOOLEAN DEFAULT false, -- Permissão herdada de outro role
    inherited_from_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    
    -- Restrições adicionais
    conditions JSONB, -- Condições extras para a permissão (ex: horários, IPs, etc.)
    resource_restrictions JSONB, -- Restrições a recursos específicos
    
    -- Validade
    expires_at TIMESTAMPTZ, -- Permissão expira em data específica
    is_temporary BOOLEAN DEFAULT false,
    
    -- Metadados
    granted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_reason TEXT, -- Motivo da concessão
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT role_permissions_unique_pair UNIQUE(role_id, permission_id),
    CONSTRAINT role_permissions_inheritance_valid CHECK (
        (is_inherited = false AND inherited_from_role_id IS NULL) OR 
        (is_inherited = true AND inherited_from_role_id IS NOT NULL)
    ),
    CONSTRAINT role_permissions_inherit_not_self CHECK (inherited_from_role_id != role_id)
);

-- Tabela de relacionamento entre users e companies (many-to-many)
CREATE TABLE IF NOT EXISTS user_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos principais
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Status do vínculo
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending, suspended
    join_type VARCHAR(20) DEFAULT 'invited', -- invited, requested, transferred, created
    
    -- Dados do convite/solicitação
    invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    invitation_token VARCHAR(255) UNIQUE, -- Token para aceitar convite
    invitation_expires_at TIMESTAMPTZ,
    
    -- Aprovação/aceitação
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ, -- Quando o usuário efetivamente entrou na empresa
    
    -- Configurações específicas da empresa
    display_name VARCHAR(100), -- Nome de exibição específico para esta empresa
    department VARCHAR(100), -- Departamento/setor
    employee_id VARCHAR(50), -- ID/código do funcionário
    start_date DATE, -- Data de início na empresa
    end_date DATE, -- Data de saída (se aplicável)
    
    -- Configurações de acesso
    is_primary_company BOOLEAN DEFAULT false, -- Empresa principal do usuário
    default_login_company BOOLEAN DEFAULT false, -- Empresa padrão no login
    can_switch_companies BOOLEAN DEFAULT true, -- Pode alternar entre empresas
    
    -- Limites e configurações
    max_daily_documents INTEGER, -- Limite diário de documentos para este usuário
    allowed_modules TEXT[], -- Módulos específicos permitidos
    restricted_ips INET[], -- IPs específicos permitidos para este usuário
    
    -- Configurações de horário
    allowed_hours_start TIME, -- Horário inicial permitido
    allowed_hours_end TIME, -- Horário final permitido
    allowed_days_week INTEGER[], -- Dias da semana permitidos (0=domingo, 6=sábado)
    timezone VARCHAR(50), -- Timezone específico para esta empresa
    
    -- Dados de auditoria
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_access_at TIMESTAMPTZ, -- Último acesso à empresa
    access_count INTEGER DEFAULT 0, -- Contador de acessos
    
    -- Metadados
    notes TEXT, -- Notas administrativas
    custom_fields JSONB, -- Campos personalizados
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_companies_unique_pair UNIQUE(user_id, company_id),
    CONSTRAINT user_companies_status_valid CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    CONSTRAINT user_companies_join_type_valid CHECK (join_type IN ('invited', 'requested', 'transferred', 'created')),
    CONSTRAINT user_companies_dates_valid CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT user_companies_hours_valid CHECK (
        (allowed_hours_start IS NULL AND allowed_hours_end IS NULL) OR
        (allowed_hours_start IS NOT NULL AND allowed_hours_end IS NOT NULL)
    ),
    CONSTRAINT user_companies_max_documents_positive CHECK (max_daily_documents IS NULL OR max_daily_documents > 0),
    CONSTRAINT user_companies_invitation_token_with_expiry CHECK (
        (invitation_token IS NULL AND invitation_expires_at IS NULL) OR
        (invitation_token IS NOT NULL AND invitation_expires_at IS NOT NULL)
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_is_granted ON role_permissions(is_granted);
CREATE INDEX IF NOT EXISTS idx_role_permissions_expires_at ON role_permissions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_status ON user_companies(status);
CREATE INDEX IF NOT EXISTS idx_user_companies_is_primary ON user_companies(is_primary_company);
CREATE INDEX IF NOT EXISTS idx_user_companies_invitation_token ON user_companies(invitation_token);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_permissions_updated_at_trigger
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_role_permissions_updated_at();

CREATE OR REPLACE FUNCTION update_user_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_companies_updated_at_trigger
    BEFORE UPDATE ON user_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_user_companies_updated_at();

-- Comentários para documentação
COMMENT ON TABLE role_permissions IS 'Relacionamento many-to-many entre roles e permissions';
COMMENT ON TABLE user_companies IS 'Relacionamento many-to-many entre usuários e empresas';