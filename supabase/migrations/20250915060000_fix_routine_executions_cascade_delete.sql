-- =============================================================================
-- Migration: Fix Routine Executions Cascade Delete
-- Generated at: 2025-09-15 06:00:00
-- =============================================================================
-- Corrige o problema de CASCADE DELETE na tabela routine_executions que estava
-- apagando execuções quando companies_routines era atualizada.
--
-- Mudanças:
-- - ALTER constraint de CASCADE para RESTRICT na FK company_routine_id
-- - ALTER constraint de CASCADE para SET NULL na FK executed_by
--
-- Isso preserva o histórico de execuções mesmo quando rotinas são modificadas.

BEGIN;

-- Drop existing foreign key constraints
ALTER TABLE routine_executions 
DROP CONSTRAINT IF EXISTS routine_executions_company_routine_id_fkey;

ALTER TABLE routine_executions 
DROP CONSTRAINT IF EXISTS routine_executions_executed_by_fkey;

-- Recreate foreign key constraints with correct behavior
ALTER TABLE routine_executions 
ADD CONSTRAINT routine_executions_company_routine_id_fkey 
FOREIGN KEY (company_routine_id) 
REFERENCES companies_routines(id) 
ON DELETE RESTRICT;

ALTER TABLE routine_executions 
ADD CONSTRAINT routine_executions_executed_by_fkey 
FOREIGN KEY (executed_by) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- Add missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_routine_executions_company_routine_id ON routine_executions(company_routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_at ON routine_executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_by ON routine_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_routine_executions_status ON routine_executions(status);
CREATE INDEX IF NOT EXISTS idx_routine_executions_created_at ON routine_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_routine_executions_next_execution_date ON routine_executions(next_execution_date);

COMMIT;

-- Comentário
COMMENT ON CONSTRAINT routine_executions_company_routine_id_fkey ON routine_executions IS 
'FK para companies_routines com RESTRICT - preserva histórico de execuções quando rotinas são modificadas';

COMMENT ON CONSTRAINT routine_executions_executed_by_fkey ON routine_executions IS 
'FK para users com SET NULL - preserva execuções mesmo quando usuário é removido';