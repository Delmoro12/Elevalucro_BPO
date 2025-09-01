-- Migration para simplificar a tabela routines em PRODUÇÃO
-- Removendo campos: category, frequency, priority, estimated_hours, requirements
-- ATENÇÃO: Esta migration irá remover dados existentes

-- Primeiro, salvar dados existentes se houver
DO $$
BEGIN
  -- Check if routines table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routines') THEN
    -- Create backup table
    CREATE TABLE IF NOT EXISTS routines_backup AS SELECT * FROM routines;
  END IF;
END $$;

-- Drop existing indexes for columns we're removing
DROP INDEX IF EXISTS idx_routines_category;
DROP INDEX IF EXISTS idx_routines_frequency;
DROP INDEX IF EXISTS idx_routines_priority;

-- Remove the columns that are no longer needed
ALTER TABLE routines DROP COLUMN IF EXISTS category;
ALTER TABLE routines DROP COLUMN IF EXISTS frequency;
ALTER TABLE routines DROP COLUMN IF EXISTS priority;
ALTER TABLE routines DROP COLUMN IF EXISTS estimated_hours;
ALTER TABLE routines DROP COLUMN IF EXISTS requirements;

-- Ensure table has the correct structure
-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Check and add columns if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routines' AND column_name = 'is_template') THEN
    ALTER TABLE routines ADD COLUMN is_template BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routines' AND column_name = 'instructions') THEN
    ALTER TABLE routines ADD COLUMN instructions TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routines' AND column_name = 'updated_at') THEN
    ALTER TABLE routines ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_is_template ON routines(is_template);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);

-- Update comments
COMMENT ON TABLE routines IS 'Master table for all routine task definitions';
COMMENT ON COLUMN routines.name IS 'Name of the routine task';
COMMENT ON COLUMN routines.description IS 'Detailed description of the routine';
COMMENT ON COLUMN routines.is_active IS 'Whether the routine is currently active';
COMMENT ON COLUMN routines.is_template IS 'If true, available as template for all companies';
COMMENT ON COLUMN routines.instructions IS 'Step-by-step instructions for completing the routine';