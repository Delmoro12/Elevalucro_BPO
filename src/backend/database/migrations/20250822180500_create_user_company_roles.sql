-- Migration: Create user company roles
-- Description: Tabela de roles específicos dos usuários em cada empresa

-- Tabela de roles dos usuários por empresa
CREATE TABLE IF NOT EXISTS user_company_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos principais
    user_company_id UUID NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Cache dos IDs para performance
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Status da atribuição
    is_active BOOLEAN DEFAULT true,
    is_primary_role BOOLEAN DEFAULT false, -- Role principal do usuário na empresa
    
    -- Metadados da atribuição
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_reason TEXT,
    assignment_type VARCHAR(20) DEFAULT 'manual', -- manual, automatic, inherited
    
    -- Configurações de validade
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ, -- NULL = sem expiração
    auto_revoke_at TIMESTAMPTZ, -- Revogação automática
    
    -- Configurações específicas
    permissions_override JSONB, -- Override de permissões específicas para este usuário
    resource_scope JSONB, -- Escopo de recursos específicos (ex: apenas certas pastas)
    conditions JSONB, -- Condições adicionais (horários, localização, etc.)
    
    -- Aprovação e workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approval_status VARCHAR(20) DEFAULT 'approved', -- pending, approved, rejected
    
    -- Auditoria e rastreamento
    last_used_at TIMESTAMPTZ, -- Última vez que usou permissões deste role
    usage_count INTEGER DEFAULT 0, -- Contador de uso das permissões
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_company_roles_unique_assignment UNIQUE(user_company_id, role_id),
    CONSTRAINT user_company_roles_assignment_type_valid CHECK (assignment_type IN ('manual', 'automatic', 'inherited')),
    CONSTRAINT user_company_roles_approval_status_valid CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT user_company_roles_valid_dates CHECK (valid_until IS NULL OR valid_until > valid_from),
    CONSTRAINT user_company_roles_user_company_match CHECK (
        (SELECT user_id FROM user_companies WHERE id = user_company_id) = user_id AND
        (SELECT company_id FROM user_companies WHERE id = user_company_id) = company_id
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_company_roles_user_company ON user_company_roles(user_company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_role_id ON user_company_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_user_id ON user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_company_id ON user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_is_active ON user_company_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_is_primary ON user_company_roles(is_primary_role);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_valid_until ON user_company_roles(valid_until);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_approval_status ON user_company_roles(approval_status);

-- Índice composto para consultas de permissões
CREATE INDEX IF NOT EXISTS idx_user_company_roles_active_permissions 
ON user_company_roles(user_id, company_id, is_active) 
WHERE is_active = true AND approval_status = 'approved';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_company_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_company_roles_updated_at_trigger
    BEFORE UPDATE ON user_company_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_company_roles_updated_at();

-- Função para sincronizar cache de user_id e company_id
CREATE OR REPLACE FUNCTION sync_user_company_roles_cache()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_company_roles_sync_cache_trigger
    BEFORE INSERT OR UPDATE OF user_company_id ON user_company_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_company_roles_cache();

-- Função para garantir apenas um role primário por usuário/empresa
CREATE OR REPLACE FUNCTION ensure_single_primary_role()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_company_roles_single_primary_trigger
    BEFORE INSERT OR UPDATE OF is_primary_role ON user_company_roles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_role();

-- View para roles ativos com informações completas
CREATE OR REPLACE VIEW user_company_roles_active AS
SELECT 
    ucr.*,
    uc.status as user_company_status,
    u.full_name,
    u.avatar_url,
    c.name as company_name,
    c.slug as company_slug,
    r.name as role_name,
    r.slug as role_slug,
    r.color as role_color,
    r.icon as role_icon,
    r.level as role_level,
    r.category as role_category
FROM user_company_roles ucr
JOIN user_companies uc ON uc.id = ucr.user_company_id
JOIN users u ON u.id = ucr.user_id
JOIN companies c ON c.id = ucr.company_id
JOIN roles r ON r.id = ucr.role_id
WHERE ucr.is_active = true 
AND ucr.approval_status = 'approved'
AND uc.status = 'active'
AND c.is_active = true
AND u.is_active = true
AND r.is_active = true
AND (ucr.valid_until IS NULL OR ucr.valid_until > now());

-- View para permissões efetivas dos usuários
CREATE OR REPLACE VIEW user_effective_permissions AS
WITH user_roles AS (
    SELECT DISTINCT
        ucra.user_id,
        ucra.company_id,
        ucra.role_id,
        ucra.permissions_override
    FROM user_company_roles_active ucra
), role_perms AS (
    SELECT 
        ur.user_id,
        ur.company_id,
        ur.role_id,
        rp.permission_id,
        rp.is_granted,
        ur.permissions_override
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE rp.is_granted = true
), effective_perms AS (
    SELECT 
        rp.user_id,
        rp.company_id,
        rp.permission_id,
        p.slug as permission_slug,
        p.name as permission_name,
        p.module,
        p.category,
        p.action,
        bool_or(rp.is_granted) as is_granted,
        array_agg(DISTINCT rp.role_id) as granted_by_roles
    FROM role_perms rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE p.is_active = true
    GROUP BY rp.user_id, rp.company_id, rp.permission_id, p.slug, p.name, p.module, p.category, p.action
)
SELECT * FROM effective_perms WHERE is_granted = true;

-- Comentários para documentação
COMMENT ON TABLE user_company_roles IS 'Roles específicos dos usuários em cada empresa';
COMMENT ON VIEW user_company_roles_active IS 'View com roles ativos e informações completas';
COMMENT ON VIEW user_effective_permissions IS 'View com todas as permissões efetivas dos usuários por empresa';