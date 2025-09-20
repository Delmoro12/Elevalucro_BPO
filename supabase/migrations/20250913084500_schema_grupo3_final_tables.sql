-- =============================================================================
-- Migration: GRUPO 3 - Final tables (companies_onboarding_checklist, routine_executions)
-- Generated at: 2025-09-13 08:45:00
-- =============================================================================

BEGIN;

-- 1. COMPANIES_ONBOARDING_CHECKLIST (depende de companies, onboarding_checklist, users)
CREATE TABLE IF NOT EXISTS companies_onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES onboarding_checklist(id) ON DELETE CASCADE,
    
    -- Denormalized checklist data (copied from onboarding_checklist for performance)
    title TEXT NOT NULL,
    description TEXT,
    week INTEGER NOT NULL CHECK (week IN (1, 2, 3, 4)),
    display_order INTEGER DEFAULT 0,
    enabled_plans TEXT[] DEFAULT ARRAY['controle', 'gerencial', 'avancado'],
    responsible_department TEXT DEFAULT 'Customer Success',
    
    -- Company-specific check status
    is_checked BOOLEAN DEFAULT false,
    
    -- Who and when it was checked
    checked_at TIMESTAMPTZ,
    checked_by UUID REFERENCES users(id),
    
    -- Optional notes specific to this company
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate checklist items per company
    UNIQUE(company_id, checklist_item_id)
);

-- Indexes for companies_onboarding_checklist performance
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_company_id ON companies_onboarding_checklist(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_checklist_item_id ON companies_onboarding_checklist(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_is_checked ON companies_onboarding_checklist(is_checked);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_checked_at ON companies_onboarding_checklist(checked_at);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_created_at ON companies_onboarding_checklist(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_week ON companies_onboarding_checklist(week);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_display_order ON companies_onboarding_checklist(display_order);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_enabled_plans ON companies_onboarding_checklist USING GIN(enabled_plans);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_responsible_department ON companies_onboarding_checklist(responsible_department);

-- Comments for companies_onboarding_checklist documentation
COMMENT ON TABLE companies_onboarding_checklist IS 'Tracks onboarding checklist progress for each company with denormalized checklist data for performance';
COMMENT ON COLUMN companies_onboarding_checklist.company_id IS 'Reference to the company being onboarded';
COMMENT ON COLUMN companies_onboarding_checklist.checklist_item_id IS 'Reference to the onboarding checklist item';
COMMENT ON COLUMN companies_onboarding_checklist.title IS 'Denormalized title of the checklist item';
COMMENT ON COLUMN companies_onboarding_checklist.description IS 'Denormalized description of the checklist item';
COMMENT ON COLUMN companies_onboarding_checklist.week IS 'Denormalized week number (1-4) for onboarding timeline';
COMMENT ON COLUMN companies_onboarding_checklist.display_order IS 'Denormalized display order within the week';
COMMENT ON COLUMN companies_onboarding_checklist.enabled_plans IS 'Denormalized array of plans where this item is enabled';
COMMENT ON COLUMN companies_onboarding_checklist.responsible_department IS 'Denormalized department responsible for this task';
COMMENT ON COLUMN companies_onboarding_checklist.is_checked IS 'Whether this item has been checked/completed by this company';
COMMENT ON COLUMN companies_onboarding_checklist.checked_at IS 'When this item was checked by this company';
COMMENT ON COLUMN companies_onboarding_checklist.checked_by IS 'User who checked this item for this company';
COMMENT ON COLUMN companies_onboarding_checklist.notes IS 'Company-specific notes about this checklist item';

-- 2. ROUTINE_EXECUTIONS (depende de companies_routines, users)
CREATE TABLE IF NOT EXISTS routine_executions (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    company_routine_id UUID NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    executed_by UUID,
    status VARCHAR(20) DEFAULT 'completed'::VARCHAR,
    notes TEXT,
    attachments TEXT[],
    time_spent_minutes INTEGER,
    next_execution_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT routine_executions_status_check CHECK ((status::TEXT = ANY ((ARRAY['completed'::VARCHAR, 'partially_completed'::VARCHAR, 'failed'::VARCHAR])::TEXT[]))),
    CONSTRAINT routine_executions_pkey PRIMARY KEY (id),
    CONSTRAINT routine_executions_company_routine_id_fkey FOREIGN KEY (company_routine_id) REFERENCES companies_routines(id) ON DELETE CASCADE,
    CONSTRAINT routine_executions_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES users(id)
);

-- Indexes for routine_executions
CREATE INDEX IF NOT EXISTS idx_routine_executions_company_routine_id ON routine_executions(company_routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_at ON routine_executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_by ON routine_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_routine_executions_status ON routine_executions(status);
CREATE INDEX IF NOT EXISTS idx_routine_executions_next_execution_date ON routine_executions(next_execution_date);
CREATE INDEX IF NOT EXISTS idx_routine_executions_created_at ON routine_executions(created_at);

-- Comments for routine_executions
COMMENT ON TABLE routine_executions IS 'History of routine executions for companies';
COMMENT ON COLUMN routine_executions.company_routine_id IS 'Reference to the company routine that was executed';
COMMENT ON COLUMN routine_executions.executed_at IS 'When the routine was executed';
COMMENT ON COLUMN routine_executions.executed_by IS 'User who executed the routine';
COMMENT ON COLUMN routine_executions.status IS 'Execution status: completed, partially_completed, failed';
COMMENT ON COLUMN routine_executions.notes IS 'Notes about the execution';
COMMENT ON COLUMN routine_executions.attachments IS 'Array of attachment URLs (documents, screenshots, etc)';
COMMENT ON COLUMN routine_executions.time_spent_minutes IS 'Time spent on execution in minutes';
COMMENT ON COLUMN routine_executions.next_execution_date IS 'Calculated date for next execution';

COMMIT;