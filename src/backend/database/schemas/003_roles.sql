-- Tabela de roles/funções do sistema
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação do role
    name VARCHAR(100) NOT NULL, -- Nome do role (ex: "Administrador", "Contador", "Assistente")
    slug VARCHAR(50) UNIQUE NOT NULL, -- Slug único (ex: "admin", "accountant", "assistant")
    description TEXT,
    
    -- Categorização
    category VARCHAR(50) DEFAULT 'custom', -- system, company, custom
    level INTEGER DEFAULT 1, -- Nível hierárquico (1 = mais alto, 10 = mais baixo)
    
    -- Configurações visuais
    color VARCHAR(7) DEFAULT '#6b7280', -- Cor do badge do role
    icon VARCHAR(50), -- Ícone do role (Lucide icon name)
    
    -- Status e tipo
    is_system_role BOOLEAN DEFAULT false, -- Roles do sistema (não podem ser deletados)
    is_active BOOLEAN DEFAULT true,
    is_assignable BOOLEAN DEFAULT true, -- Pode ser atribuído a usuários
    
    -- Configurações de permissões
    inherit_from_role_id UUID REFERENCES roles(id) ON DELETE SET NULL, -- Herda permissões de outro role
    max_users_with_role INTEGER, -- Limite de usuários que podem ter este role
    requires_approval BOOLEAN DEFAULT false, -- Requer aprovação para atribuir
    
    -- Configurações de empresa
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL = role global/sistema
    
    -- Configurações de validade
    expires_after_days INTEGER, -- Role expira após X dias
    auto_revoke_inactive_days INTEGER, -- Remove role se usuário inativo por X dias
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT roles_slug_format CHECK (slug ~ '^[a-z0-9_-]+$'),
    CONSTRAINT roles_category_valid CHECK (category IN ('system', 'company', 'custom')),
    CONSTRAINT roles_level_valid CHECK (level >= 1 AND level <= 10),
    CONSTRAINT roles_max_users_positive CHECK (max_users_with_role IS NULL OR max_users_with_role > 0),
    CONSTRAINT roles_system_role_no_company CHECK (NOT (is_system_role = true AND company_id IS NOT NULL)),
    CONSTRAINT roles_inherit_not_self CHECK (inherit_from_role_id != id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_is_system_role ON roles(is_system_role);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at_trigger
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_updated_at();

-- Inserir roles padrão do sistema
INSERT INTO roles (name, slug, description, category, level, color, icon, is_system_role, is_active, company_id) VALUES
-- Roles de sistema (globais)
('Super Administrador', 'super_admin', 'Acesso total ao sistema e todas as empresas', 'system', 1, '#dc2626', 'Crown', true, true, NULL),
('Administrador de Sistema', 'system_admin', 'Administrador do sistema com acesso a configurações globais', 'system', 2, '#ea580c', 'Settings', true, true, NULL),
('Suporte Técnico', 'support', 'Equipe de suporte técnico com acesso limitado', 'system', 3, '#2563eb', 'Headphones', true, true, NULL),

-- Roles padrão para empresas (serão copiados para cada nova empresa)
('Proprietário', 'owner', 'Proprietário da empresa com acesso total', 'company', 1, '#059669', 'Building2', false, true, NULL),
('Administrador', 'admin', 'Administrador da empresa com acesso quase total', 'company', 2, '#dc2626', 'UserCheck', false, true, NULL),
('Gerente Financeiro', 'financial_manager', 'Gerencia aspectos financeiros e relatórios', 'company', 3, '#7c3aed', 'Calculator', false, true, NULL),
('Contador', 'accountant', 'Responsável pela contabilidade e lançamentos', 'company', 4, '#0891b2', 'Receipt', false, true, NULL),
('Analista', 'analyst', 'Analisa dados e gera relatórios', 'company', 5, '#059669', 'BarChart3', false, true, NULL),
('Assistente', 'assistant', 'Auxilia nas operações do dia a dia', 'company', 6, '#6b7280', 'Users', false, true, NULL),
('Consultor', 'consultant', 'Acesso de consulta e relatórios', 'company', 7, '#f59e0b', 'Eye', false, true, NULL),
('Visualizador', 'viewer', 'Apenas visualização de dados básicos', 'company', 8, '#94a3b8', 'Search', false, true, NULL)

ON CONFLICT (slug) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE roles IS 'Roles/funções que podem ser atribuídos aos usuários';
COMMENT ON COLUMN roles.slug IS 'Identificador único do role (usado no código)';
COMMENT ON COLUMN roles.category IS 'Categoria: system (global), company (por empresa), custom (personalizado)';
COMMENT ON COLUMN roles.level IS 'Nível hierárquico (1 = mais alto, 10 = mais baixo)';
COMMENT ON COLUMN roles.inherit_from_role_id IS 'Role do qual este role herda permissões';
COMMENT ON COLUMN roles.company_id IS 'Empresa à qual o role pertence (NULL = role global)';
COMMENT ON COLUMN roles.expires_after_days IS 'Role expira automaticamente após X dias';
COMMENT ON COLUMN roles.auto_revoke_inactive_days IS 'Remove role se usuário inativo por X dias';