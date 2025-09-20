-- =============================================================================
-- View: user_company_view
-- =============================================================================
-- View consolidada com dados completos de usuários, empresas, perfis e assinaturas
-- Usada principalmente na tela de Clientes Operacionais
-- Data: 2025-01-09
-- =============================================================================

CREATE OR REPLACE VIEW user_company_view AS
SELECT 
    -- Dados do usuário
    u.id as user_id,
    u.email,
    u.full_name,
    u.first_name,
    u.last_name,
    u.phone,
    u.whatsapp,
    u.is_active as user_is_active,
    u.is_verified,
    u.verification_level,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    
    -- Dados da empresa
    c.id as company_id,
    c.name as company_name,
    c.slug as company_slug,
    c.email as company_email,
    c.phone as company_phone,
    c.cnpj,
    c.is_active as company_is_active,
    c.created_at as company_created_at,
    
    -- Dados do perfil
    p.id as profile_id,
    p.name as profile_name,
    
    -- Dados da role
    r.id as role_id,
    r.name as role_name,
    r.description as role_description,
    
    -- Dados da assinatura
    s.id as subscription_id,
    s.plan_type,
    s.status as subscription_status,
    s.created_at as subscription_created_at,
    s.updated_at as subscription_updated_at,
    
    -- Campos calculados
    CASE 
        WHEN u.is_active AND c.is_active THEN 'active'
        WHEN NOT u.is_active THEN 'user_inactive'
        WHEN NOT c.is_active THEN 'company_inactive'
        ELSE 'inactive'
    END as overall_status,
    
    -- Data do último acesso (pode ser implementado futuramente)
    u.updated_at as last_access_at,
    
    -- Indicadores
    CASE 
        WHEN s.status = 'active' THEN true
        ELSE false
    END as has_active_subscription,
    
    CASE
        WHEN r.name = 'client_side' THEN 'cliente'
        WHEN r.name = 'bpo_side' THEN 'operador'
        ELSE 'outro'
    END as user_type

FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN profiles p ON u.profile_id = p.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE u.company_id IS NOT NULL  -- Apenas usuários com empresa (exclui BPO operators sem empresa)
ORDER BY u.created_at DESC;

-- Comentário da view
COMMENT ON VIEW user_company_view IS 'View consolidada com dados de usuários e suas empresas, perfis e assinaturas. Usada na tela de Clientes Operacionais.';

-- Permissões
GRANT SELECT ON user_company_view TO authenticated;
GRANT SELECT ON user_company_view TO service_role;