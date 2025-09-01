-- ======================================
-- 12. Routines
-- ======================================
-- Master table for routine tasks definitions

CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic fields
    name TEXT NOT NULL,
    description TEXT,
    
    -- Control fields
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true, -- If true, available as template for all companies
    
    -- Instructions
    instructions TEXT, -- Detailed instructions on how to complete the task
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_is_template ON routines(is_template);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);

-- Comments
COMMENT ON TABLE routines IS 'Master table for all routine task definitions';
COMMENT ON COLUMN routines.name IS 'Name of the routine task';
COMMENT ON COLUMN routines.description IS 'Detailed description of the routine';
COMMENT ON COLUMN routines.is_active IS 'Whether the routine is currently active';
COMMENT ON COLUMN routines.is_template IS 'If true, available as template for all companies';
COMMENT ON COLUMN routines.instructions IS 'Step-by-step instructions for completing the routine';