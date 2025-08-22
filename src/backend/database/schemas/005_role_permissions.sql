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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_is_granted ON role_permissions(is_granted);
CREATE INDEX IF NOT EXISTS idx_role_permissions_expires_at ON role_permissions(expires_at);
CREATE INDEX IF NOT EXISTS idx_role_permissions_inherited_from ON role_permissions(inherited_from_role_id);

-- Trigger para atualizar updated_at
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

-- Função para sincronizar permissões herdadas
CREATE OR REPLACE FUNCTION sync_inherited_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um role é atualizado para herdar de outro role
    IF NEW.inherit_from_role_id IS NOT NULL AND (OLD.inherit_from_role_id IS NULL OR OLD.inherit_from_role_id != NEW.inherit_from_role_id) THEN
        
        -- Remove permissões herdadas antigas
        DELETE FROM role_permissions 
        WHERE role_id = NEW.id AND is_inherited = true;
        
        -- Adiciona permissões do role pai
        INSERT INTO role_permissions (role_id, permission_id, is_granted, is_inherited, inherited_from_role_id)
        SELECT NEW.id, rp.permission_id, rp.is_granted, true, NEW.inherit_from_role_id
        FROM role_permissions rp
        WHERE rp.role_id = NEW.inherit_from_role_id 
        AND rp.is_granted = true
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions existing 
            WHERE existing.role_id = NEW.id 
            AND existing.permission_id = rp.permission_id
        );
        
    -- Quando remove herança
    ELSIF NEW.inherit_from_role_id IS NULL AND OLD.inherit_from_role_id IS NOT NULL THEN
        -- Remove todas as permissões herdadas
        DELETE FROM role_permissions 
        WHERE role_id = NEW.id AND is_inherited = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_sync_inherited_permissions_trigger
    AFTER UPDATE OF inherit_from_role_id ON roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_inherited_permissions();

-- Inserir permissões padrão para roles do sistema
DO $$
DECLARE
    super_admin_role_id UUID;
    system_admin_role_id UUID;
    support_role_id UUID;
    owner_role_id UUID;
    admin_role_id UUID;
    financial_manager_role_id UUID;
    accountant_role_id UUID;
    analyst_role_id UUID;
    assistant_role_id UUID;
    consultant_role_id UUID;
    viewer_role_id UUID;
    perm_id UUID;
BEGIN
    -- Buscar IDs dos roles
    SELECT id INTO super_admin_role_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO system_admin_role_id FROM roles WHERE slug = 'system_admin';
    SELECT id INTO support_role_id FROM roles WHERE slug = 'support';
    SELECT id INTO owner_role_id FROM roles WHERE slug = 'owner';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'admin';
    SELECT id INTO financial_manager_role_id FROM roles WHERE slug = 'financial_manager';
    SELECT id INTO accountant_role_id FROM roles WHERE slug = 'accountant';
    SELECT id INTO analyst_role_id FROM roles WHERE slug = 'analyst';
    SELECT id INTO assistant_role_id FROM roles WHERE slug = 'assistant';
    SELECT id INTO consultant_role_id FROM roles WHERE slug = 'consultant';
    SELECT id INTO viewer_role_id FROM roles WHERE slug = 'viewer';

    -- Super Admin: TODAS as permissões
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT super_admin_role_id, id, true FROM permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- System Admin: Permissões de sistema (exceto gerenciar sistema)
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT system_admin_role_id, id, true FROM permissions 
    WHERE slug != 'system.manage'
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Owner: Todas as permissões da empresa
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT owner_role_id, id, true FROM permissions 
    WHERE module IN ('companies', 'users', 'roles', 'permissions', 'documents', 'integrations', 'reports', 'settings', 'finance')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Admin: Maioria das permissões (sem deletar empresa)
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT admin_role_id, id, true FROM permissions 
    WHERE module IN ('users', 'roles', 'documents', 'integrations', 'reports', 'settings', 'finance')
    AND slug NOT IN ('companies.delete', 'companies.settings.manage')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Financial Manager: Permissões financeiras + relatórios + documentos
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT financial_manager_role_id, id, true FROM permissions 
    WHERE module IN ('finance', 'reports', 'documents') 
    OR slug IN ('users.read', 'companies.read', 'settings.notifications.configure')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Accountant: Documentos + financeiro básico
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT accountant_role_id, id, true FROM permissions 
    WHERE module = 'documents' 
    OR slug IN ('finance.read', 'finance.entries.update', 'finance.reconcile', 'reports.dashboard.read', 'reports.generate')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Analyst: Relatórios + visualização
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT analyst_role_id, id, true FROM permissions 
    WHERE module = 'reports' 
    OR slug IN ('documents.read', 'finance.read', 'users.read', 'companies.read')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Assistant: Operações básicas
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT assistant_role_id, id, true FROM permissions 
    WHERE slug IN (
        'documents.create', 'documents.read', 'documents.update', 'documents.ai.process',
        'users.profile.read', 'users.profile.update',
        'reports.dashboard.read',
        'integrations.use'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Consultant: Visualização + relatórios
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT consultant_role_id, id, true FROM permissions 
    WHERE category = 'read' OR module = 'reports'
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- Viewer: Apenas visualização básica
    INSERT INTO role_permissions (role_id, permission_id, is_granted)
    SELECT viewer_role_id, id, true FROM permissions 
    WHERE slug IN (
        'documents.read', 'reports.dashboard.read', 'users.profile.read', 'users.profile.update'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;

END $$;

-- Comentários para documentação
COMMENT ON TABLE role_permissions IS 'Relacionamento many-to-many entre roles e permissions';
COMMENT ON COLUMN role_permissions.is_granted IS 'true = concede permissão, false = revoga explicitamente';
COMMENT ON COLUMN role_permissions.is_inherited IS 'Permissão herdada de outro role (inherit_from_role_id)';
COMMENT ON COLUMN role_permissions.conditions IS 'Condições extras em JSON (horários, IPs, etc.)';
COMMENT ON COLUMN role_permissions.resource_restrictions IS 'Restrições a recursos específicos em JSON';
COMMENT ON COLUMN role_permissions.expires_at IS 'Data de expiração da permissão';
COMMENT ON COLUMN role_permissions.granted_reason IS 'Motivo da concessão da permissão';