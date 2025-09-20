-- =============================================================================
-- Migration: Views Operacionais
-- Generated at: 2025-09-13 09:45:00
-- =============================================================================
-- Views para dashboards e relatórios operacionais do sistema:
-- 1. Companies Routines Summary
-- 2. Company Routines Details
-- 3. Operational Health Score
-- 4. Onboarding Companies Kanban
-- 5. User Company View

BEGIN;

-- ======================================
-- 1. COMPANIES ROUTINES SUMMARY
-- ======================================
-- Resumo das rotinas por empresa para dashboard operacional

CREATE OR REPLACE VIEW companies_routines_summary AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as email,
  c.phone as phone,
  c.segment as segment,
  c.subscription_plan as plan,
  c.lifecycle_stage,
  c.created_at,
  
  -- Total de rotinas da empresa
  COUNT(cr.routine_id) as total_rotinas,
  
  -- Rotinas por status
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = true) as rotinas_ativas,
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = false) as rotinas_inativas,
  
  -- Execuções no último mês
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') as execucoes_ultimo_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'completed') as execucoes_completadas_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'failed') as execucoes_falharam_mes,
  
  -- Próxima rotina agendada
  (
    SELECT json_build_object(
      'routine_title', r_next.name,
      'next_execution', cr_next.next_execution_date
    )
    FROM companies_routines cr_next
    JOIN routines r_next ON cr_next.routine_id = r_next.id
    WHERE cr_next.company_id = c.id 
    AND cr_next.is_active = true
    AND cr_next.next_execution_date IS NOT NULL
    AND cr_next.next_execution_date > NOW()
    ORDER BY cr_next.next_execution_date ASC
    LIMIT 1
  ) as proxima_rotina,
  
  -- Rotinas atrasadas
  COUNT(cr.routine_id) FILTER (
    WHERE cr.is_active = true 
    AND cr.next_execution_date IS NOT NULL 
    AND cr.next_execution_date < NOW()
  ) as rotinas_atrasadas,
  
  -- Score de saúde operacional (0-100)
  CASE 
    WHEN COUNT(cr.routine_id) = 0 THEN 0
    ELSE 
      GREATEST(0, LEAST(100, 
        -- Base: rotinas ativas vs total (40%)
        (COUNT(cr.routine_id) FILTER (WHERE cr.is_active = true)::float / GREATEST(1, COUNT(cr.routine_id)) * 40) +
        
        -- Execuções bem-sucedidas no mês (40%)
        (COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'completed')::float / 
         GREATEST(1, COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days')) * 40) +
        
        -- Penalidade por rotinas atrasadas (20%)
        (20 - LEAST(20, COUNT(cr.routine_id) FILTER (
          WHERE cr.is_active = true 
          AND cr.next_execution_date IS NOT NULL 
          AND cr.next_execution_date < NOW()
        ) * 5))
      ))
  END as health_score,
  
  -- Valor mensal do plano
  CASE 
    WHEN c.subscription_plan = 'controle' THEN 950.00
    WHEN c.subscription_plan = 'gerencial' THEN 1300.00
    WHEN c.subscription_plan = 'avancado' THEN 1700.00
    ELSE 0.00
  END as valor_mensal

FROM companies c
LEFT JOIN companies_routines cr ON c.id = cr.company_id
LEFT JOIN routines r ON cr.routine_id = r.id
LEFT JOIN routine_executions rh ON cr.id = rh.company_routine_id
WHERE c.is_active = true
GROUP BY 
  c.id, c.name, c.email, c.phone, c.segment, c.subscription_plan, 
  c.lifecycle_stage, c.created_at
ORDER BY health_score DESC, c.name ASC;

-- ======================================
-- 2. COMPANY ROUTINES DETAILS
-- ======================================
-- Detalhes completos das rotinas de uma empresa específica

CREATE OR REPLACE VIEW company_routines_details AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as email,
  c.phone as phone,
  c.segment as segment,
  c.subscription_plan as plan,
  
  -- Informações da rotina
  r.id as routine_id,
  r.name as routine_title,
  r.description as routine_description,
  
  -- Status da rotina para a empresa
  cr.id as company_routine_id,
  cr.is_active as routine_is_active,
  cr.custom_frequency as routine_custom_schedule,
  cr.next_execution_date as routine_next_execution,
  cr.last_execution_date as routine_last_execution,
  cr.assigned_to as routine_assigned_to,
  cr.created_at as routine_added_at,
  
  -- Informações do usuário responsável
  u.full_name as assigned_to_name,
  u.email as assigned_to_email,
  
  -- Histórico de execuções (últimas 10)
  (
    SELECT json_agg(
      json_build_object(
        'id', rh.id,
        'executed_at', rh.executed_at,
        'status', rh.status,
        'executed_by_name', u_exec.full_name,
        'executed_by_email', u_exec.email,
        'observations', rh.notes,
        'attachments', rh.attachments
      )
      ORDER BY rh.executed_at DESC
    )
    FROM routine_executions rh
    LEFT JOIN users u_exec ON rh.executed_by = u_exec.id
    WHERE rh.company_routine_id = cr.id
    LIMIT 10
  ) as execution_history,
  
  -- Estatísticas de execução
  (
    SELECT json_build_object(
      'total_executions', COUNT(rh.id),
      'successful_executions', COUNT(rh.id) FILTER (WHERE rh.status = 'completed'),
      'failed_executions', COUNT(rh.id) FILTER (WHERE rh.status = 'failed'),
      'last_30_days_executions', COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days'),
      'success_rate_30_days', 
        CASE 
          WHEN COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') = 0 THEN 0
          ELSE 
            (COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'completed')::float / 
             COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') * 100)
        END
    )
    FROM routine_executions rh
    WHERE rh.company_routine_id = cr.id
  ) as execution_stats,
  
  -- Status da rotina
  CASE
    WHEN NOT cr.is_active THEN 'inactive'
    WHEN cr.next_execution_date IS NULL THEN 'not_scheduled'
    WHEN cr.next_execution_date < NOW() THEN 'overdue'
    WHEN cr.next_execution_date <= NOW() + INTERVAL '1 day' THEN 'due_soon'
    WHEN cr.next_execution_date <= NOW() + INTERVAL '7 days' THEN 'upcoming'
    ELSE 'scheduled'
  END as routine_status,
  
  -- Próxima execução em dias
  CASE 
    WHEN cr.next_execution_date IS NULL THEN NULL
    ELSE EXTRACT(DAYS FROM (cr.next_execution_date - NOW()))
  END as days_until_next_execution,
  
  -- Última execução em dias atrás
  CASE 
    WHEN cr.last_execution_date IS NULL THEN NULL
    ELSE EXTRACT(DAYS FROM (NOW() - cr.last_execution_date))
  END as days_since_last_execution

FROM companies c
JOIN companies_routines cr ON c.id = cr.company_id
JOIN routines r ON cr.routine_id = r.id
LEFT JOIN users u ON cr.assigned_to = u.id
WHERE c.is_active = true
ORDER BY 
  c.name ASC,
  CASE cr.is_active WHEN true THEN 0 ELSE 1 END,
  CASE
    WHEN cr.next_execution_date IS NULL THEN 3
    WHEN cr.next_execution_date < NOW() THEN 0  -- Atrasadas primeiro
    WHEN cr.next_execution_date <= NOW() + INTERVAL '1 day' THEN 1  -- Próximas
    ELSE 2  -- Futuras
  END,
  cr.next_execution_date ASC NULLS LAST;

-- ======================================
-- 3. OPERATIONAL HEALTH SCORE
-- ======================================
-- Score de saúde operacional consolidado por empresa

CREATE OR REPLACE VIEW operational_health_score AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as email,
  c.segment as segment,
  c.subscription_plan as plan,
  c.lifecycle_stage,
  c.created_at,
  
  -- Métricas de Onboarding (só para empresas em onboarding)
  CASE 
    WHEN c.lifecycle_stage = 'onboarding' THEN
      json_build_object(
        'progress_percentage', c.onboarding_progress,
        'days_in_onboarding', EXTRACT(DAYS FROM (NOW() - c.created_at)),
        'expected_completion_week', 
          CASE 
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
            ELSE 'semana_4'
          END,
        'completed_items', COALESCE(onb_stats.completed_items, 0),
        'total_items', COALESCE(onb_stats.total_items, 0),
        'on_track', 
          CASE 
            WHEN COALESCE(onb_stats.total_items, 0) = 0 THEN false
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 AND (onb_stats.completed_items::float / onb_stats.total_items) >= 0.25 THEN true
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 AND (onb_stats.completed_items::float / onb_stats.total_items) >= 0.50 THEN true
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 AND (onb_stats.completed_items::float / onb_stats.total_items) >= 0.75 THEN true
            WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) > 21 AND (onb_stats.completed_items::float / onb_stats.total_items) >= 0.90 THEN true
            ELSE false
          END
      )
    ELSE NULL
  END as onboarding_metrics,
  
  -- Métricas de Rotinas Operacionais
  json_build_object(
    'total_routines', COALESCE(routine_stats.total_routines, 0),
    'active_routines', COALESCE(routine_stats.active_routines, 0),
    'overdue_routines', COALESCE(routine_stats.overdue_routines, 0),
    'executions_last_30_days', COALESCE(routine_stats.executions_30d, 0),
    'successful_executions_30d', COALESCE(routine_stats.successful_30d, 0),
    'success_rate_30d', 
      CASE 
        WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
        ELSE (routine_stats.successful_30d::float / routine_stats.executions_30d * 100)
      END
  ) as routine_metrics,
  
  -- Score Geral de Saúde (0-100)
  CASE 
    -- Empresas em onboarding
    WHEN c.lifecycle_stage = 'onboarding' THEN
      GREATEST(0, LEAST(100, 
        -- Progresso do onboarding (60%)
        (c.onboarding_progress * 0.6) +
        
        -- Execução de rotinas básicas (40%)
        CASE 
          WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
          ELSE (routine_stats.successful_30d::float / GREATEST(1, routine_stats.executions_30d) * 40)
        END
      ))
    
    -- Empresas operacionais
    WHEN c.lifecycle_stage = 'operational' THEN
      GREATEST(0, LEAST(100,
        -- Rotinas ativas vs total (30%)
        CASE 
          WHEN COALESCE(routine_stats.total_routines, 0) = 0 THEN 0
          ELSE (routine_stats.active_routines::float / routine_stats.total_routines * 30)
        END +
        
        -- Taxa de sucesso nas execuções (50%)
        CASE 
          WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
          ELSE (routine_stats.successful_30d::float / routine_stats.executions_30d * 50)
        END +
        
        -- Penalidade por rotinas atrasadas (20%)
        (20 - LEAST(20, COALESCE(routine_stats.overdue_routines, 0) * 4))
      ))
    
    ELSE 50  -- Score neutro para outros status
  END as health_score,
  
  -- Classificação do Score
  CASE 
    WHEN c.lifecycle_stage = 'onboarding' THEN
      CASE 
        WHEN GREATEST(0, LEAST(100, (c.onboarding_progress * 0.6) + 
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / GREATEST(1, routine_stats.executions_30d) * 40) END
        )) >= 80 THEN 'excellent'
        WHEN GREATEST(0, LEAST(100, (c.onboarding_progress * 0.6) + 
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / GREATEST(1, routine_stats.executions_30d) * 40) END
        )) >= 60 THEN 'good'
        WHEN GREATEST(0, LEAST(100, (c.onboarding_progress * 0.6) + 
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / GREATEST(1, routine_stats.executions_30d) * 40) END
        )) >= 40 THEN 'warning'
        ELSE 'critical'
      END
    WHEN c.lifecycle_stage = 'operational' THEN
      CASE 
        WHEN GREATEST(0, LEAST(100,
          CASE WHEN COALESCE(routine_stats.total_routines, 0) = 0 THEN 0
               ELSE (routine_stats.active_routines::float / routine_stats.total_routines * 30) END +
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / routine_stats.executions_30d * 50) END +
          (20 - LEAST(20, COALESCE(routine_stats.overdue_routines, 0) * 4))
        )) >= 80 THEN 'excellent'
        WHEN GREATEST(0, LEAST(100,
          CASE WHEN COALESCE(routine_stats.total_routines, 0) = 0 THEN 0
               ELSE (routine_stats.active_routines::float / routine_stats.total_routines * 30) END +
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / routine_stats.executions_30d * 50) END +
          (20 - LEAST(20, COALESCE(routine_stats.overdue_routines, 0) * 4))
        )) >= 60 THEN 'good'
        WHEN GREATEST(0, LEAST(100,
          CASE WHEN COALESCE(routine_stats.total_routines, 0) = 0 THEN 0
               ELSE (routine_stats.active_routines::float / routine_stats.total_routines * 30) END +
          CASE WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN 0
               ELSE (routine_stats.successful_30d::float / routine_stats.executions_30d * 50) END +
          (20 - LEAST(20, COALESCE(routine_stats.overdue_routines, 0) * 4))
        )) >= 40 THEN 'warning'
        ELSE 'critical'
      END
    ELSE 'neutral'
  END as health_classification,
  
  -- Recomendações baseadas no score
  CASE 
    WHEN c.lifecycle_stage = 'onboarding' AND COALESCE(onb_stats.completed_items, 0) = 0 THEN 
      ARRAY['Iniciar checklist de onboarding', 'Atribuir responsável para acompanhamento']
    WHEN c.lifecycle_stage = 'onboarding' AND c.onboarding_progress < 25 AND EXTRACT(DAYS FROM (NOW() - c.created_at)) > 7 THEN
      ARRAY['Acelerar processo de onboarding', 'Revisar itens pendentes da semana 1']
    WHEN c.lifecycle_stage = 'operational' AND COALESCE(routine_stats.overdue_routines, 0) > 0 THEN
      ARRAY['Executar rotinas em atraso', 'Revisar cronograma de execução']
    WHEN c.lifecycle_stage = 'operational' AND COALESCE(routine_stats.active_routines, 0) < 3 THEN
      ARRAY['Ativar mais rotinas operacionais', 'Configurar rotinas essenciais']
    WHEN COALESCE(routine_stats.executions_30d, 0) = 0 THEN
      ARRAY['Executar rotinas pendentes', 'Verificar configuração de cronograma']
    ELSE ARRAY['Manter ritmo atual', 'Monitorar indicadores regularmente']
  END as recommendations,
  
  -- Data da última atualização
  NOW() as calculated_at

FROM companies c

-- Estatísticas de onboarding
LEFT JOIN (
  SELECT 
    coc.company_id,
    COUNT(coc.checklist_item_id) as total_items,
    COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = true) as completed_items
  FROM companies_onboarding_checklist coc
  GROUP BY coc.company_id
) onb_stats ON c.id = onb_stats.company_id

-- Estatísticas de rotinas
LEFT JOIN (
  SELECT 
    cr.company_id,
    COUNT(cr.id) as total_routines,
    COUNT(cr.id) FILTER (WHERE cr.is_active = true) as active_routines,
    COUNT(cr.id) FILTER (WHERE cr.is_active = true AND cr.next_execution_date IS NOT NULL AND cr.next_execution_date < NOW()) as overdue_routines,
    COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') as executions_30d,
    COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status IN ('completed', 'partially_completed')) as successful_30d
  FROM companies_routines cr
  LEFT JOIN routine_executions rh ON cr.id = rh.company_routine_id
  GROUP BY cr.company_id
) routine_stats ON c.id = routine_stats.company_id

WHERE c.is_active = true
ORDER BY health_score DESC, c.name ASC;

-- ======================================
-- 4. ONBOARDING COMPANIES KANBAN
-- ======================================
-- Single unified view for both kanban listing and modal details

CREATE OR REPLACE VIEW onboarding_companies_kanban AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  c.email as email,
  c.phone as telefone,  
  c.segment as segmento,
  c.subscription_plan as plano,
  c.onboarding_progress as progresso_onboarding,
  c.lifecycle_stage,
  c.created_at as data_inicio,
  
  -- Calcular semana de onboarding baseada em dias desde criação
  CASE 
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
    ELSE 'semana_4'
  END as semana_onboarding,
  
  -- Dias desde criação
  EXTRACT(DAYS FROM (NOW() - c.created_at)) as dias_desde_criacao,
  
  -- Checklist items completo (para modal) - usando dados desnormalizados
  CASE 
    WHEN COUNT(coc.id) = 0 THEN '[]'::json
    ELSE json_agg(
      json_build_object(
        'id', coc.checklist_item_id,
        'title', coc.title,
        'description', coc.description,
        'week', coc.week,
        'display_order', coc.display_order,
        'enabled_plans', coc.enabled_plans,
        'responsible_department', coc.responsible_department,
        'is_checked', coc.is_checked,
        'checked_at', coc.checked_at,
        'checked_by', u.full_name,
        'notes', coc.notes
      )
      ORDER BY coc.week ASC, coc.display_order ASC
    )
  END as checklist_items,
  
  -- Contadores gerais (para kanban e modal)
  COUNT(coc.id) as total_checklist_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = false) as pending_items,
  
  -- Estatísticas por semana (para modal)
  COUNT(coc.id) FILTER (WHERE coc.week = 1) as semana_1_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 1 AND coc.is_checked = true) as semana_1_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 2) as semana_2_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 2 AND coc.is_checked = true) as semana_2_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 3) as semana_3_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 3 AND coc.is_checked = true) as semana_3_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 4) as semana_4_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 4 AND coc.is_checked = true) as semana_4_completed,
  
  -- Próxima ação (para kanban) - primeiro item não checado
  (
    SELECT coc_next.title
    FROM companies_onboarding_checklist coc_next
    WHERE coc_next.company_id = c.id 
    AND coc_next.is_checked = false
    ORDER BY coc_next.week ASC, coc_next.display_order ASC
    LIMIT 1
  ) as proxima_acao,
  
  -- Informações do plano/assinatura
  s.status as subscription_status,
  CASE 
    WHEN c.subscription_plan = 'controle' THEN 950.00
    WHEN c.subscription_plan = 'gerencial' THEN 1300.00
    WHEN c.subscription_plan = 'avancado' THEN 1700.00
    ELSE 0.00
  END as valor_mensal,
  
  -- Responsável padrão (pode ser customizado depois)
  CASE 
    WHEN c.subscription_plan = 'avancado' THEN 'Consultor Sênior'
    WHEN c.subscription_plan = 'gerencial' THEN 'Consultor Pleno'
    ELSE 'Consultor Junior'
  END as responsavel

FROM companies c
LEFT JOIN companies_onboarding_checklist coc ON c.id = coc.company_id
LEFT JOIN users u ON coc.checked_by = u.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'  -- Só empresas em onboarding
GROUP BY 
  c.id, c.name, c.email, c.phone, c.segment, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;  -- Mais antigas primeiro

-- ======================================
-- 5. USER COMPANY VIEW
-- ======================================
-- View consolidada com dados completos de usuários, empresas, perfis e assinaturas

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

-- ======================================
-- COMMENTS E PERMISSIONS
-- ======================================

-- Comments
COMMENT ON VIEW companies_routines_summary IS 
'View para resumo das rotinas por empresa - dashboard operacional com métricas de execução,
health score, próximas rotinas e estatísticas por categoria/frequência.';

COMMENT ON VIEW company_routines_details IS 
'View para detalhes completos das rotinas por empresa - inclui histórico de execução,
estatísticas, informações do responsável e status detalhado para gestão operacional.';

COMMENT ON VIEW operational_health_score IS 
'View consolidada para score de saúde operacional - combina métricas de onboarding e rotinas
para classificar empresas e gerar recomendações de ação automatizadas.';

COMMENT ON VIEW onboarding_companies_kanban IS 
'View principal para o kanban de onboarding - serve tanto para listagem quanto para detalhes do modal.
Usa apenas companies_onboarding_checklist (desnormalizada) para melhor performance.
Retorna lista vazia de checklist_items quando empresa não tem itens cadastrados.';

COMMENT ON VIEW user_company_view IS 'View consolidada com dados de usuários e suas empresas, perfis e assinaturas. Usada na tela de Clientes Operacionais.';

-- Permissions
GRANT SELECT ON user_company_view TO authenticated;
GRANT SELECT ON user_company_view TO service_role;

COMMIT;