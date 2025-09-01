-- ======================================
-- 14. Companies Onboarding Checklist
-- ======================================
-- Tracks onboarding checklist progress for each company (simplified)

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_company_id ON companies_onboarding_checklist(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_checklist_item_id ON companies_onboarding_checklist(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_is_checked ON companies_onboarding_checklist(is_checked);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_checked_at ON companies_onboarding_checklist(checked_at);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_created_at ON companies_onboarding_checklist(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_week ON companies_onboarding_checklist(week);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_display_order ON companies_onboarding_checklist(display_order);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_enabled_plans ON companies_onboarding_checklist USING GIN(enabled_plans);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_responsible_department ON companies_onboarding_checklist(responsible_department);

-- Comments for documentation
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