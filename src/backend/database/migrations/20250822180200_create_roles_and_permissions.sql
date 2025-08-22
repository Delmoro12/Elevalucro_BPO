-- Migration: Create roles and permissions tables
-- Description: Sistema de roles hierárquicos e permissões granulares

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

-- Tabela de permissões do sistema
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação da permissão
    name VARCHAR(100) NOT NULL, -- Nome descritivo da permissão
    slug VARCHAR(100) UNIQUE NOT NULL, -- Identificador único (ex: "documents.create")
    description TEXT,
    
    -- Organização
    module VARCHAR(50) NOT NULL, -- Módulo (documents, users, companies, etc.)
    category VARCHAR(50) DEFAULT 'general', -- read, write, admin, special
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, list, etc.
    
    -- Configurações
    is_system_permission BOOLEAN DEFAULT false, -- Permissões críticas do sistema
    requires_ownership BOOLEAN DEFAULT false, -- Requer ser dono do recurso
    requires_same_company BOOLEAN DEFAULT true, -- Requer estar na mesma empresa
    
    -- Dependências
    depends_on_permission_ids UUID[], -- Array de UUIDs de permissões dependentes
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT permissions_slug_format CHECK (slug ~ '^[a-z0-9_.]+$'),
    CONSTRAINT permissions_category_valid CHECK (category IN ('read', 'write', 'admin', 'special', 'general')),
    CONSTRAINT permissions_module_valid CHECK (module ~ '^[a-z_]+$')
);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_is_system_role ON roles(is_system_role);

-- Índices para permissions
CREATE INDEX IF NOT EXISTS idx_permissions_slug ON permissions(slug);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_is_active ON permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_is_system ON permissions(is_system_permission);

-- Triggers para updated_at
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

CREATE OR REPLACE FUNCTION update_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER permissions_updated_at_trigger
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_permissions_updated_at();

-- Comentários para documentação
COMMENT ON TABLE roles IS 'Roles/funções que podem ser atribuídos aos usuários';
COMMENT ON TABLE permissions IS 'Permissões granulares do sistema organizadas por módulos';