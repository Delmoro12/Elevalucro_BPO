-- =============================================================================
-- Migration: Update Routine Executions History View
-- Generated at: 2025-09-15 07:00:00
-- =============================================================================
-- Atualiza a view routine_executions_history para incluir o campo created_at
-- e ordenar por data de criação em vez de data de execução.
--
-- Mudanças:
-- - Adiciona campo re.created_at na seleção
-- - Altera ordenação de re.executed_at DESC para re.created_at DESC
-- - Atualiza comentário da view
--
-- Isso garante que execuções recentes apareçam no topo do histórico,
-- independentemente da data retroativa que foi marcada.

BEGIN;

-- Drop existing view
DROP VIEW IF EXISTS routine_executions_history;

-- Recreate the view with updated fields and ordering
CREATE VIEW routine_executions_history AS
SELECT 
  re.id as execution_id,
  re.executed_at,
  re.created_at,
  
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

ORDER BY re.created_at DESC;

-- Update comment
COMMENT ON VIEW routine_executions_history IS 
'View para histórico de execuções de rotinas filtrado por empresa - execuções ordenadas por data de criação 
com nome, descrição, instrução da rotina, usuário executor, data/hora da execução e data de criação.';

COMMIT;