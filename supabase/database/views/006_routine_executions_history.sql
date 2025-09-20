-- ======================================
-- View: Routine Executions History
-- ======================================
-- Histórico de execuções de rotinas por empresa

CREATE OR REPLACE VIEW routine_executions_history AS
SELECT 
  re.id as execution_id,
  re.executed_at,
  re.created_at,
  
  -- Informações da empresa (para filtro)
  cr.company_id,
  
  -- Informações da rotina (template ou customizada)
  COALESCE(cr.custom_name, r.name) as routine_name,
  COALESCE(cr.custom_description, r.description) as routine_description,
  COALESCE(cr.custom_instructions, r.instructions) as routine_instructions,
  
  -- Informações do usuário que executou
  u.full_name as executed_by_name

FROM routine_executions re
JOIN companies_routines cr ON re.company_routine_id = cr.id
LEFT JOIN routines r ON cr.routine_id = r.id
LEFT JOIN users u ON re.executed_by = u.id
JOIN companies c ON cr.company_id = c.id

WHERE c.is_active = true

ORDER BY re.created_at DESC;

-- Comentário
COMMENT ON VIEW routine_executions_history IS 
'View para histórico de execuções de rotinas filtrado por empresa - execuções ordenadas por data de criação 
com nome, descrição, instrução da rotina, usuário executor, data/hora da execução e data de criação.
Suporta tanto rotinas baseadas em templates quanto rotinas customizadas (routine_id nulo).';