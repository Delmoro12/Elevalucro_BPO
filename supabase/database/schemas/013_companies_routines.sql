-- ======================================
-- 13. Companies Routines
-- ======================================
-- Relationship table linking companies to their specific routines

CREATE TABLE IF NOT EXISTS companies_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    
    -- Company-specific customizations
    custom_name TEXT, -- Company can override the routine name
    custom_description TEXT, -- Company can override the description
    custom_instructions TEXT, -- Company-specific instructions
    custom_frequency VARCHAR(20), -- Company can override frequency
    custom_priority VARCHAR(20) CHECK (custom_priority IN ('low', 'medium', 'high', 'critical', NULL)),
    
    -- Assignment and responsibility
    assigned_to UUID REFERENCES users(id), -- User responsible for this routine
    assigned_team VARCHAR(100), -- Team or department responsible
    
    -- Schedule settings
    start_date DATE, -- When this routine starts for the company
    end_date DATE, -- Optional end date for temporary routines
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- For weekly routines (1=Monday, 7=Sunday)
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31), -- For monthly routines
    month_of_year INTEGER CHECK (month_of_year BETWEEN 1 AND 12), -- For yearly routines
    
    -- Execution tracking
    last_completed_at TIMESTAMPTZ,
    last_completed_by UUID REFERENCES users(id),
    completion_count INTEGER DEFAULT 0,
    
    -- Status and control
    is_active BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    pause_reason TEXT,
    
    -- Notifications
    notify_before_hours INTEGER DEFAULT 24, -- Hours before due date to send notification
    notify_on_overdue BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate assignments
    UNIQUE(company_id, routine_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_routines_company_id ON companies_routines(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_routines_routine_id ON companies_routines(routine_id);
CREATE INDEX IF NOT EXISTS idx_companies_routines_assigned_to ON companies_routines(assigned_to);
CREATE INDEX IF NOT EXISTS idx_companies_routines_is_active ON companies_routines(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_routines_is_paused ON companies_routines(is_paused);
CREATE INDEX IF NOT EXISTS idx_companies_routines_start_date ON companies_routines(start_date);
CREATE INDEX IF NOT EXISTS idx_companies_routines_last_completed_at ON companies_routines(last_completed_at);
CREATE INDEX IF NOT EXISTS idx_companies_routines_created_at ON companies_routines(created_at);

-- Comments
COMMENT ON TABLE companies_routines IS 'Links companies to their specific routine tasks with customizations';
COMMENT ON COLUMN companies_routines.company_id IS 'Reference to the company';
COMMENT ON COLUMN companies_routines.routine_id IS 'Reference to the routine template';
COMMENT ON COLUMN companies_routines.custom_name IS 'Company-specific name override';
COMMENT ON COLUMN companies_routines.custom_description IS 'Company-specific description override';
COMMENT ON COLUMN companies_routines.custom_instructions IS 'Company-specific instructions';
COMMENT ON COLUMN companies_routines.custom_frequency IS 'Company-specific frequency override';
COMMENT ON COLUMN companies_routines.custom_priority IS 'Company-specific priority override';
COMMENT ON COLUMN companies_routines.assigned_to IS 'User responsible for this routine';
COMMENT ON COLUMN companies_routines.assigned_team IS 'Team or department responsible';
COMMENT ON COLUMN companies_routines.start_date IS 'When this routine becomes active for the company';
COMMENT ON COLUMN companies_routines.end_date IS 'Optional end date for temporary routines';
COMMENT ON COLUMN companies_routines.day_of_week IS 'For weekly routines (1=Monday, 7=Sunday)';
COMMENT ON COLUMN companies_routines.day_of_month IS 'For monthly routines (1-31)';
COMMENT ON COLUMN companies_routines.month_of_year IS 'For yearly routines (1-12)';
COMMENT ON COLUMN companies_routines.last_completed_at IS 'Timestamp of last completion';
COMMENT ON COLUMN companies_routines.last_completed_by IS 'User who last completed this routine';
COMMENT ON COLUMN companies_routines.completion_count IS 'Total number of times completed';
COMMENT ON COLUMN companies_routines.is_paused IS 'Temporarily pause this routine';
COMMENT ON COLUMN companies_routines.notify_before_hours IS 'Hours before due date to send notification';
COMMENT ON COLUMN companies_routines.notify_on_overdue IS 'Send notification when overdue';