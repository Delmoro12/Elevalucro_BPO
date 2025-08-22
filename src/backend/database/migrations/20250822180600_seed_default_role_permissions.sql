-- Migration: Seed default role permissions
-- Description: Inserir permissões padrão para cada role do sistema

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