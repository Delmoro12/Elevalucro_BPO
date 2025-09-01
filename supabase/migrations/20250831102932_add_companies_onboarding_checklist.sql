-- ======================================
-- ElevaLucro BPO - Companies Onboarding Checklist Table (Simplified)
-- ======================================

CREATE TABLE companies_onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES onboarding_checklist(id) ON DELETE CASCADE,
    
    -- Simple check status
    is_checked BOOLEAN DEFAULT false,
    
    -- Who and when it was checked
    checked_at TIMESTAMPTZ,
    checked_by UUID REFERENCES users(id),
    
    -- Optional notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(company_id, checklist_item_id)
);

-- Create indexes for performance
CREATE INDEX idx_companies_onboarding_company_id ON companies_onboarding_checklist(company_id);
CREATE INDEX idx_companies_onboarding_checklist_item_id ON companies_onboarding_checklist(checklist_item_id);
CREATE INDEX idx_companies_onboarding_is_checked ON companies_onboarding_checklist(is_checked);
CREATE INDEX idx_companies_onboarding_checked_at ON companies_onboarding_checklist(checked_at);
CREATE INDEX idx_companies_onboarding_created_at ON companies_onboarding_checklist(created_at);

-- Add comments for documentation
COMMENT ON TABLE companies_onboarding_checklist IS 'Tracks onboarding checklist progress for each company (simplified)';
COMMENT ON COLUMN companies_onboarding_checklist.is_checked IS 'Simple boolean: checked or unchecked';
COMMENT ON COLUMN companies_onboarding_checklist.checked_at IS 'Timestamp when item was checked';
COMMENT ON COLUMN companies_onboarding_checklist.checked_by IS 'User who checked the item';
COMMENT ON COLUMN companies_onboarding_checklist.notes IS 'Optional notes about this checklist item';