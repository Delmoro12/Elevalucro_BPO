-- ======================================
-- View: Company Routines Details
-- ======================================
-- Detalhes completos das rotinas de uma empresa específica

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
  -- r.category as routine_category, -- removed
  -- r.frequency as routine_frequency, -- removed  
  -- r.estimated_hours as routine_estimated_hours, -- removed
  
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
      'successful_executions', COUNT(rh.id) FILTER (WHERE rh.status = 'completed'),
      'failed_executions', COUNT(rh.id) FILTER (WHERE rh.status = 'failed'),
      'avg_duration_minutes', AVG(rh.time_spent_minutes),
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

-- Comentário
COMMENT ON VIEW company_routines_details IS 
'View para detalhes completos das rotinas por empresa - inclui histórico de execução,
estatísticas, informações do responsável e status detalhado para gestão operacional.';