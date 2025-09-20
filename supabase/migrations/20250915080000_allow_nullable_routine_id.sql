-- =============================================================================
-- Migration: Allow nullable routine_id in companies_routines
-- Generated at: 2025-09-15 08:00:00
-- =============================================================================
-- Permite que routine_id seja nulo na tabela companies_routines para suportar
-- rotinas customizadas que não se baseiam em templates.
--
-- Mudanças:
-- - Remove constraint NOT NULL de routine_id
-- - Remove constraint UNIQUE(company_id, routine_id) 
-- - Atualiza comentário da coluna
--
-- Isso permite que empresas criem rotinas personalizadas sem precisar
-- de um template base.

BEGIN;

-- Remove the unique constraint first
ALTER TABLE companies_routines DROP CONSTRAINT IF EXISTS companies_routines_company_id_routine_id_key;

-- Allow routine_id to be nullable
ALTER TABLE companies_routines ALTER COLUMN routine_id DROP NOT NULL;

-- Update column comment
COMMENT ON COLUMN companies_routines.routine_id IS 'Reference to the routine template (nullable for custom routines)';

-- Update table comment
COMMENT ON TABLE companies_routines IS 'Links companies to their specific routine tasks with customizations. routine_id can be null for custom routines.';

COMMIT;