-- Migration: Create routine executions history view
-- Date: 2025-09-15
-- Description: View para histórico de execuções de rotinas filtrado por empresa

CREATE OR REPLACE VIEW routine_executions_history AS
SELECT 
  re.id as execution_id,
  re.executed_at,
  
  -- Informações da empresa (para filtro)
  cr.company_id,
  
  -- Informações da rotina
  r.name as routine_name,
  r.description as routine_description,
  r.instructions as routine_instructions,
  
  -- Informações do usuário que executou
  u.full_name as executed_by_name

FROM routine_executions re
JOIN companies_routines cr ON re.company_routine_id = cr.id
JOIN routines r ON cr.routine_id = r.id
LEFT JOIN users u ON re.executed_by = u.id
JOIN companies c ON cr.company_id = c.id

WHERE c.is_active = true

ORDER BY re.executed_at DESC;

-- Comentário
COMMENT ON VIEW routine_executions_history IS 
'View para histórico de execuções de rotinas filtrado por empresa - apenas execuções concluídas 
com nome, descrição, instrução da rotina, usuário executor e data/hora da execução.';