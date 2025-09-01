-- Migration para simplificar a tabela routines
-- Removendo campos: category, frequency, priority, estimated_hours, requirements

-- Drop existing indexes for columns we're removing
DROP INDEX IF EXISTS idx_routines_category;
DROP INDEX IF EXISTS idx_routines_frequency;
DROP INDEX IF EXISTS idx_routines_priority;

-- Drop the table and recreate with simplified structure
DROP TABLE IF EXISTS routines CASCADE;

-- Create the simplified routines table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_is_template ON routines(is_template);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);

-- Add comments
COMMENT ON TABLE routines IS 'Master table for all routine task definitions';
COMMENT ON COLUMN routines.name IS 'Name of the routine task';
COMMENT ON COLUMN routines.description IS 'Detailed description of the routine';
COMMENT ON COLUMN routines.is_active IS 'Whether the routine is currently active';
COMMENT ON COLUMN routines.is_template IS 'If true, available as template for all companies';
COMMENT ON COLUMN routines.instructions IS 'Step-by-step instructions for completing the routine';