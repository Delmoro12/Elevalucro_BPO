-- Migration para corrigir estrutura da tabela onboarding_checklist
-- Baseada no arquivo supabase/database/schemas/011_onboarding_checklist.sql

-- Drop the existing table and recreate with correct structure
DROP TABLE IF EXISTS onboarding_checklist CASCADE;

-- Create the table with the correct structure
CREATE TABLE IF NOT EXISTS onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic fields
    title TEXT NOT NULL,
    week INTEGER NOT NULL CHECK (week IN (1, 2, 3, 4)),
    
    -- Optional description for more context
    description TEXT,
    
    -- Plan configuration - which plans this checklist item applies to
    enabled_plans TEXT[] DEFAULT ARRAY['controle', 'gerencial', 'avancado'],
    
    -- Responsible department/team for this task
    responsible_department TEXT DEFAULT 'Customer Success',
    
    -- Control fields
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_week ON onboarding_checklist(week);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_is_active ON onboarding_checklist(is_active);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_display_order ON onboarding_checklist(display_order);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_enabled_plans ON onboarding_checklist USING GIN(enabled_plans);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_responsible_department ON onboarding_checklist(responsible_department);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_created_at ON onboarding_checklist(created_at);

-- Add comments
COMMENT ON TABLE onboarding_checklist IS 'Checklist items for client onboarding process organized by weeks';
COMMENT ON COLUMN onboarding_checklist.title IS 'Title of the checklist item';
COMMENT ON COLUMN onboarding_checklist.week IS 'Week number (1-4) for onboarding timeline';
COMMENT ON COLUMN onboarding_checklist.description IS 'Optional description for additional context';
COMMENT ON COLUMN onboarding_checklist.enabled_plans IS 'Array of plans where this checklist item is enabled (controle, gerencial, avancado)';
COMMENT ON COLUMN onboarding_checklist.responsible_department IS 'Department or team responsible for completing this task';
COMMENT ON COLUMN onboarding_checklist.is_active IS 'Whether the checklist item is active';
COMMENT ON COLUMN onboarding_checklist.display_order IS 'Order for displaying items within the same week';
COMMENT ON COLUMN onboarding_checklist.created_at IS 'Timestamp when the item was created';
COMMENT ON COLUMN onboarding_checklist.updated_at IS 'Timestamp when the item was last updated';