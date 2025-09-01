-- ======================================
-- Create All Onboarding and Routine Views
-- ======================================

-- View 1: Companies Onboarding Kanban
CREATE OR REPLACE VIEW companies_onboarding_kanban AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
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
  
  -- Contadores de checklist
  COUNT(coc.checklist_item_id) as total_checklist_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = false) as pending_items,
  
  -- Próxima ação (primeiro item não checado ordenado por semana/ordem)
  (
    SELECT oc.title
    FROM companies_onboarding_checklist coc_next
    JOIN onboarding_checklist oc ON coc_next.checklist_item_id = oc.id
    WHERE coc_next.company_id = c.id 
    AND coc_next.is_checked = false
    AND oc.is_active = true
    ORDER BY oc.week ASC, oc.display_order ASC
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
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'  -- Só empresas em onboarding
GROUP BY 
  c.id, c.name, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;  -- Mais antigas primeiro

COMMENT ON VIEW companies_onboarding_kanban IS 
'View para Kanban de onboarding - lista empresas em processo de onboarding com informações para cards, 
incluindo semana atual, progresso, próxima ação e responsável.';

-- View 2: Company Onboarding Details
CREATE OR REPLACE VIEW company_onboarding_details AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
  c.onboarding_progress as progresso_onboarding,
  c.lifecycle_stage,
  c.created_at as data_inicio,
  
  -- Calcular semana de onboarding
  CASE 
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
    ELSE 'semana_4'
  END as semana_onboarding,
  
  -- Dias desde criação
  EXTRACT(DAYS FROM (NOW() - c.created_at)) as dias_desde_criacao,
  
  -- Informações do checklist por semana
  json_agg(
    json_build_object(
      'id', oc.id,
      'title', oc.title,
      'description', oc.description,
      'week', oc.week,
      'display_order', oc.display_order,
      'is_active', oc.is_active,
      'is_checked', COALESCE(coc.is_checked, false),
      'checked_at', coc.checked_at,
      'checked_by', u.full_name,
      'notes', coc.notes
    )
    ORDER BY oc.week ASC, oc.display_order ASC
  ) as checklist_items,
  
  -- Estatísticas do onboarding
  COUNT(oc.id) as total_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = false OR coc.is_checked IS NULL) as pending_items,
  
  -- Estatísticas por semana
  COUNT(oc.id) FILTER (WHERE oc.week = 1) as semana_1_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 1 AND coc.is_checked = true) as semana_1_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 2) as semana_2_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 2 AND coc.is_checked = true) as semana_2_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 3) as semana_3_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 3 AND coc.is_checked = true) as semana_3_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 4) as semana_4_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 4 AND coc.is_checked = true) as semana_4_completed,
  
  -- Próxima ação
  (
    SELECT oc_next.title
    FROM onboarding_checklist oc_next
    LEFT JOIN companies_onboarding_checklist coc_next ON oc_next.id = coc_next.checklist_item_id 
      AND coc_next.company_id = c.id
    WHERE oc_next.is_active = true
    AND (coc_next.is_checked = false OR coc_next.is_checked IS NULL)
    ORDER BY oc_next.week ASC, oc_next.display_order ASC
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
  
  -- Responsável (pode ser customizado depois)
  CASE 
    WHEN c.subscription_plan = 'avancado' THEN 'Consultor Sênior'
    WHEN c.subscription_plan = 'gerencial' THEN 'Consultor Pleno'
    ELSE 'Consultor Junior'
  END as responsavel

FROM companies c
LEFT JOIN onboarding_checklist oc ON oc.is_active = true
LEFT JOIN companies_onboarding_checklist coc ON c.id = coc.company_id AND oc.id = coc.checklist_item_id
LEFT JOIN users u ON coc.checked_by = u.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'
GROUP BY 
  c.id, c.name, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;

COMMENT ON VIEW company_onboarding_details IS 
'View para detalhes completos do onboarding de uma empresa - usada no modal com checklist completo,
estatísticas por semana, próxima ação e informações detalhadas do plano.';

-- View 3: Companies Routines Summary
CREATE OR REPLACE VIEW companies_routines_summary AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
  c.lifecycle_stage,
  c.created_at,
  
  -- Total de rotinas da empresa
  COUNT(cr.routine_id) as total_rotinas,
  
  -- Rotinas por status
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = true) as rotinas_ativas,
  COUNT(cr.routine_id) FILTER (WHERE cr.is_active = false) as rotinas_inativas,
  
  -- Rotinas por frequência
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'daily') as rotinas_diarias,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'weekly') as rotinas_semanais,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'monthly') as rotinas_mensais,
  COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'quarterly') as rotinas_trimestrais,
  
  -- Rotinas por categoria
  COUNT(cr.routine_id) FILTER (WHERE r.category = 'financial') as rotinas_financeiras,
  COUNT(cr.routine_id) FILTER (WHERE r.category = 'operational') as rotinas_operacionais,
  COUNT(cr.routine_id) FILTER (WHERE r.category = 'compliance') as rotinas_compliance,
  COUNT(cr.routine_id) FILTER (WHERE r.category = 'reporting') as rotinas_relatorios,
  COUNT(cr.routine_id) FILTER (WHERE r.category = 'analysis') as rotinas_analise,
  
  -- Execuções no último mês
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') as execucoes_ultimo_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status IN ('completed', 'partially_completed')) as execucoes_completadas_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'failed') as execucoes_falharam_mes,
  
  -- Próxima rotina agendada
  (
    SELECT json_build_object(
      'routine_title', r_next.name,
      'next_execution', cr_next.next_execution_date,
      'frequency', r_next.frequency,
      'category', r_next.category
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
        (COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status IN ('completed', 'partially_completed'))::float / 
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
  c.id, c.name, c.subscription_plan, 
  c.lifecycle_stage, c.created_at
ORDER BY health_score DESC, c.name ASC;

COMMENT ON VIEW companies_routines_summary IS 
'View para resumo das rotinas por empresa - dashboard operacional com métricas de execução,
health score, próximas rotinas e estatísticas por categoria/frequência.';

-- View 4: Company Routines Details
CREATE OR REPLACE VIEW company_routines_details AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
  
  -- Informações da rotina
  r.id as routine_id,
  r.name as routine_title,
  r.description as routine_description,
  r.category as routine_category,
  r.frequency as routine_frequency,
  r.estimated_hours as routine_estimated_hours,
  
  -- Status da rotina para a empresa
  cr.id as company_routine_id,
  cr.is_active as routine_is_active,
  cr.custom_frequency as routine_custom_schedule,
  cr.next_execution_date as routine_next_execution,
  cr.last_execution_date as routine_last_execution,
  cr.assigned_to as routine_assigned_to,
  cr.notes as routine_notes,
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
        'duration_minutes', rh.time_spent_minutes,
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
      'successful_executions', COUNT(rh.id) FILTER (WHERE rh.status IN ('completed', 'partially_completed')),
      'failed_executions', COUNT(rh.id) FILTER (WHERE rh.status = 'failed'),
      'avg_duration_minutes', AVG(rh.time_spent_minutes),
      'last_30_days_executions', COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days'),
      'success_rate_30_days', 
        CASE 
          WHEN COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') = 0 THEN 0
          ELSE 
            (COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status IN ('completed', 'partially_completed'))::float / 
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

COMMENT ON VIEW company_routines_details IS 
'View para detalhes completos das rotinas por empresa - inclui histórico de execução,
estatísticas, informações do responsável e status detalhado para gestão operacional.';

-- View 5: Operational Health Score
CREATE OR REPLACE VIEW operational_health_score AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
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
      END,
    'avg_execution_time', COALESCE(routine_stats.avg_duration, 0)
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
    COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status IN ('completed', 'partially_completed')) as successful_30d,
    AVG(rh.time_spent_minutes) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') as avg_duration
  FROM companies_routines cr
  LEFT JOIN routine_executions rh ON cr.id = rh.company_routine_id
  GROUP BY cr.company_id
) routine_stats ON c.id = routine_stats.company_id

WHERE c.is_active = true
ORDER BY health_score DESC, c.name ASC;

COMMENT ON VIEW operational_health_score IS 
'View consolidada para score de saúde operacional - combina métricas de onboarding e rotinas
para classificar empresas e gerar recomendações de ação automatizadas.';

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Created 5 views for onboarding and routine management system';
END $$;