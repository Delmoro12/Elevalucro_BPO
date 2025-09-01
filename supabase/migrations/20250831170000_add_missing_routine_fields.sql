-- ======================================
-- Add Missing Fields to Companies Routines
-- ======================================

-- Add missing fields that are referenced in views but don't exist in schema
ALTER TABLE companies_routines 
ADD COLUMN IF NOT EXISTS next_execution_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_execution_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing field to companies_onboarding_checklist (observações)
ALTER TABLE companies_onboarding_checklist
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_companies_routines_next_execution ON companies_routines(next_execution_date);
CREATE INDEX IF NOT EXISTS idx_companies_routines_last_execution ON companies_routines(last_execution_date);

-- Add comments
COMMENT ON COLUMN companies_routines.next_execution_date IS 'Data da próxima execução programada';
COMMENT ON COLUMN companies_routines.last_execution_date IS 'Data da última execução realizada';
COMMENT ON COLUMN companies_routines.notes IS 'Observações sobre a rotina específica da empresa';
COMMENT ON COLUMN companies_onboarding_checklist.observacoes IS 'Observações adicionais sobre o item do checklist';

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Added missing fields: next_execution_date, last_execution_date, notes to companies_routines and observacoes to companies_onboarding_checklist';
END $$;