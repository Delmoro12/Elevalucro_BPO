-- Migration: Seed default roles and permissions
-- Description: Inserir roles padrão e permissões do sistema

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

-- Inserir permissões padrão do sistema
INSERT INTO permissions (name, slug, description, module, category, action, is_system_permission, requires_ownership, requires_same_company) VALUES

-- === SISTEMA ===
('Gerenciar Sistema', 'system.manage', 'Acesso total às configurações do sistema', 'system', 'admin', 'manage', true, false, false),
('Visualizar Logs do Sistema', 'system.logs.read', 'Visualizar logs e auditoria do sistema', 'system', 'read', 'read', true, false, false),
('Gerenciar Planos de Assinatura', 'system.plans.manage', 'Criar e editar planos de assinatura', 'system', 'admin', 'manage', true, false, false),

-- === EMPRESAS ===
('Criar Empresas', 'companies.create', 'Criar novas empresas', 'companies', 'write', 'create', false, false, false),
('Visualizar Empresas', 'companies.read', 'Visualizar informações da empresa', 'companies', 'read', 'read', false, false, true),
('Editar Empresas', 'companies.update', 'Editar informações da empresa', 'companies', 'write', 'update', false, false, true),
('Deletar Empresas', 'companies.delete', 'Deletar empresas', 'companies', 'admin', 'delete', false, false, true),
('Gerenciar Configurações da Empresa', 'companies.settings.manage', 'Gerenciar configurações avançadas', 'companies', 'admin', 'manage', false, false, true),
('Visualizar Relatórios da Empresa', 'companies.reports.read', 'Acessar relatórios e dashboards', 'companies', 'read', 'read', false, false, true),

-- === USUÁRIOS ===
('Convidar Usuários', 'users.invite', 'Enviar convites para novos usuários', 'users', 'write', 'create', false, false, true),
('Visualizar Usuários', 'users.read', 'Visualizar lista e perfis de usuários', 'users', 'read', 'read', false, false, true),
('Editar Usuários', 'users.update', 'Editar informações de usuários', 'users', 'write', 'update', false, false, true),
('Remover Usuários', 'users.remove', 'Remover usuários da empresa', 'users', 'admin', 'delete', false, false, true),
('Gerenciar Roles de Usuários', 'users.roles.manage', 'Atribuir e remover roles', 'users', 'admin', 'manage', false, false, true),
('Visualizar Próprio Perfil', 'users.profile.read', 'Visualizar próprio perfil', 'users', 'read', 'read', false, true, false),
('Editar Próprio Perfil', 'users.profile.update', 'Editar próprio perfil', 'users', 'write', 'update', false, true, false),

-- === ROLES E PERMISSÕES ===
('Criar Roles', 'roles.create', 'Criar novos roles personalizados', 'roles', 'admin', 'create', false, false, true),
('Visualizar Roles', 'roles.read', 'Visualizar roles disponíveis', 'roles', 'read', 'read', false, false, true),
('Editar Roles', 'roles.update', 'Editar roles existentes', 'roles', 'admin', 'update', false, false, true),
('Deletar Roles', 'roles.delete', 'Deletar roles personalizados', 'roles', 'admin', 'delete', false, false, true),
('Gerenciar Permissões', 'permissions.manage', 'Gerenciar permissões dos roles', 'permissions', 'admin', 'manage', false, false, true),

-- === DOCUMENTOS ===
('Criar Documentos', 'documents.create', 'Upload e criação de documentos', 'documents', 'write', 'create', false, false, true),
('Visualizar Documentos', 'documents.read', 'Visualizar documentos e dados', 'documents', 'read', 'read', false, false, true),
('Editar Documentos', 'documents.update', 'Editar informações dos documentos', 'documents', 'write', 'update', false, false, true),
('Deletar Documentos', 'documents.delete', 'Deletar documentos', 'documents', 'write', 'delete', false, false, true),
('Processar com IA', 'documents.ai.process', 'Usar IA para processamento automático', 'documents', 'write', 'process', false, false, true),
('Exportar Documentos', 'documents.export', 'Exportar documentos e relatórios', 'documents', 'read', 'export', false, false, true),
('Aprovar Documentos', 'documents.approve', 'Aprovar documentos para contabilização', 'documents', 'admin', 'approve', false, false, true),

-- === INTEGRAÇÕES ===
('Configurar Integrações', 'integrations.configure', 'Configurar APIs e integrações', 'integrations', 'admin', 'configure', false, false, true),
('Usar Integrações', 'integrations.use', 'Utilizar integrações configuradas', 'integrations', 'write', 'use', false, false, true),
('Visualizar Logs de Integração', 'integrations.logs.read', 'Ver logs de sincronização', 'integrations', 'read', 'read', false, false, true),

-- === RELATÓRIOS ===
('Visualizar Dashboard', 'reports.dashboard.read', 'Acessar dashboard principal', 'reports', 'read', 'read', false, false, true),
('Gerar Relatórios', 'reports.generate', 'Gerar relatórios personalizados', 'reports', 'read', 'generate', false, false, true),
('Exportar Relatórios', 'reports.export', 'Exportar relatórios em diversos formatos', 'reports', 'read', 'export', false, false, true),
('Agendar Relatórios', 'reports.schedule', 'Agendar envio automático de relatórios', 'reports', 'write', 'schedule', false, false, true),

-- === CONFIGURAÇÕES ===
('Gerenciar Configurações', 'settings.manage', 'Gerenciar configurações da empresa', 'settings', 'admin', 'manage', false, false, true),
('Configurar Notificações', 'settings.notifications.configure', 'Configurar notificações e alertas', 'settings', 'write', 'configure', false, false, true),
('Gerenciar Backup', 'settings.backup.manage', 'Configurar e gerenciar backups', 'settings', 'admin', 'manage', false, false, true),

-- === FINANCEIRO ===
('Visualizar Financeiro', 'finance.read', 'Visualizar dados financeiros', 'finance', 'read', 'read', false, false, true),
('Editar Lançamentos', 'finance.entries.update', 'Criar e editar lançamentos financeiros', 'finance', 'write', 'update', false, false, true),
('Aprovar Lançamentos', 'finance.entries.approve', 'Aprovar lançamentos financeiros', 'finance', 'admin', 'approve', false, false, true),
('Conciliar Extratos', 'finance.reconcile', 'Realizar conciliação bancária', 'finance', 'write', 'reconcile', false, false, true)

ON CONFLICT (slug) DO NOTHING;