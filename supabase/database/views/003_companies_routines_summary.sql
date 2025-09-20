-- ======================================
-- View: Companies Routines Summary
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
  
  -- Rotinas por frequência (campos removidos)
  -- COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'daily') as rotinas_diarias,
  -- COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'weekly') as rotinas_semanais,
  -- COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'monthly') as rotinas_mensais,
  -- COUNT(cr.routine_id) FILTER (WHERE r.frequency = 'quarterly') as rotinas_trimestrais,
  
  -- Rotinas por categoria (campos removidos)
  -- COUNT(cr.routine_id) FILTER (WHERE r.category = 'financial') as rotinas_financeiras,
  -- COUNT(cr.routine_id) FILTER (WHERE r.category = 'operational') as rotinas_operacionais,
  -- COUNT(cr.routine_id) FILTER (WHERE r.category = 'compliance') as rotinas_compliance,
  -- COUNT(cr.routine_id) FILTER (WHERE r.category = 'reporting') as rotinas_relatorios,
  -- COUNT(cr.routine_id) FILTER (WHERE r.category = 'analysis') as rotinas_analise,
  
  -- Execuções no último mês
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days') as execucoes_ultimo_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'completed') as execucoes_completadas_mes,
  COUNT(rh.id) FILTER (WHERE rh.executed_at >= NOW() - INTERVAL '30 days' AND rh.status = 'failed') as execucoes_falharam_mes,
  
  -- Próxima rotina agendada
  (
    SELECT json_build_object(
      'routine_title', r_next.name,
      'next_execution', cr_next.next_execution_date
      -- 'frequency', r_next.frequency, -- removed
      -- 'category', r_next.category -- removed
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

-- Comentário
COMMENT ON VIEW companies_routines_summary IS 
'View para resumo das rotinas por empresa - dashboard operacional com métricas de execução,
health score, próximas rotinas e estatísticas por categoria/frequência.';