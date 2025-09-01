-- ======================================
-- ElevaLucro BPO - Onboarding Checklist Table
-- ======================================

-- Create onboarding_checklist table
CREATE TABLE onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic fields
    title TEXT NOT NULL,
    week INTEGER NOT NULL CHECK (week IN (1, 2, 3, 4)),
    
    -- Optional description for more context
    description TEXT,
    
    -- Control fields
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps following the pattern
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes following the established pattern
CREATE INDEX idx_onboarding_checklist_week ON onboarding_checklist(week);
CREATE INDEX idx_onboarding_checklist_is_active ON onboarding_checklist(is_active);
CREATE INDEX idx_onboarding_checklist_display_order ON onboarding_checklist(display_order);
CREATE INDEX idx_onboarding_checklist_created_at ON onboarding_checklist(created_at);

-- Add comment to table
COMMENT ON TABLE onboarding_checklist IS 'Checklist items for client onboarding process organized by weeks';
COMMENT ON COLUMN onboarding_checklist.week IS 'Week number (1-4) for onboarding timeline';
COMMENT ON COLUMN onboarding_checklist.display_order IS 'Order for displaying items within the same week';