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
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_status ON user_companies(status);
CREATE INDEX IF NOT EXISTS idx_user_companies_is_primary ON user_companies(is_primary_company);
CREATE INDEX IF NOT EXISTS idx_user_companies_invitation_token ON user_companies(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_companies_invitation_expires ON user_companies(invitation_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_companies_last_access ON user_companies(last_access_at);

-- Trigger para atualizar updated_at
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

-- Função para garantir apenas uma empresa primária por usuário
CREATE OR REPLACE FUNCTION ensure_single_primary_company()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está marcando como primária
    IF NEW.is_primary_company = true THEN
        -- Remove a flag de outras empresas do mesmo usuário
        UPDATE user_companies 
        SET is_primary_company = false 
        WHERE user_id = NEW.user_id 
        AND company_id != NEW.company_id 
        AND is_primary_company = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_companies_single_primary_trigger
    BEFORE INSERT OR UPDATE OF is_primary_company ON user_companies
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_company();

-- Função para limpar convites expirados
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE user_companies 
    SET 
        status = 'inactive',
        invitation_token = NULL,
        invitation_expires_at = NULL
    WHERE 
        status = 'pending' 
        AND invitation_expires_at < now()
        AND invitation_token IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar token de convite
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-gerar token quando necessário
CREATE OR REPLACE FUNCTION auto_generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é um convite pendente sem token
    IF NEW.status = 'pending' AND NEW.join_type = 'invited' AND NEW.invitation_token IS NULL THEN
        NEW.invitation_token = generate_invitation_token();
        NEW.invitation_expires_at = COALESCE(NEW.invitation_expires_at, now() + interval '7 days');
        NEW.invited_at = COALESCE(NEW.invited_at, now());
    END IF;
    
    -- Se aceitou o convite
    IF NEW.status = 'active' AND OLD.status = 'pending' THEN
        NEW.joined_at = now();
        NEW.invitation_token = NULL;
        NEW.invitation_expires_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_companies_auto_token_trigger
    BEFORE INSERT OR UPDATE ON user_companies
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invitation_token();

-- View para dados de usuários com suas empresas ativas
CREATE OR REPLACE VIEW user_companies_active AS
SELECT 
    uc.*,
    u.full_name,
    u.avatar_url,
    u.email_notifications,
    c.name as company_name,
    c.slug as company_slug,
    c.logo_url as company_logo,
    c.is_active as company_is_active
FROM user_companies uc
JOIN users u ON u.id = uc.user_id
JOIN companies c ON c.id = uc.company_id
WHERE uc.status = 'active' 
AND c.is_active = true
AND u.is_active = true;

-- Comentários para documentação
COMMENT ON TABLE user_companies IS 'Relacionamento many-to-many entre usuários e empresas';
COMMENT ON COLUMN user_companies.status IS 'Status do vínculo: active, inactive, pending, suspended';
COMMENT ON COLUMN user_companies.join_type IS 'Como o usuário entrou: invited, requested, transferred, created';
COMMENT ON COLUMN user_companies.invitation_token IS 'Token único para aceitar convite';
COMMENT ON COLUMN user_companies.is_primary_company IS 'Empresa principal do usuário (apenas uma por usuário)';
COMMENT ON COLUMN user_companies.employee_id IS 'ID/código do funcionário na empresa';
COMMENT ON COLUMN user_companies.allowed_modules IS 'Array de módulos específicos permitidos';
COMMENT ON COLUMN user_companies.restricted_ips IS 'Array de IPs específicos permitidos';
COMMENT ON COLUMN user_companies.allowed_days_week IS 'Array de dias da semana permitidos (0=domingo, 6=sábado)';
COMMENT ON COLUMN user_companies.custom_fields IS 'Campos personalizados em formato JSON';