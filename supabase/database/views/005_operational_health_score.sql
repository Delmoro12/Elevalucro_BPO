-- ======================================
-- View: Operational Health Score
-- ======================================
-- Score de saúde operacional consolidado por empresa

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

-- Comentário
COMMENT ON VIEW operational_health_score IS 
'View consolidada para score de saúde operacional - combina métricas de onboarding e rotinas
para classificar empresas e gerar recomendações de ação automatizadas.';