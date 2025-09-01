-- ======================================
-- ElevaLucro BPO - Routines System Tables
-- ======================================

-- 1. Create routines table (master table for routine definitions)
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic fields
    name TEXT NOT NULL,
    description TEXT,
    
    -- Category and type
    category VARCHAR(50),
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
    
    -- Task details
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_hours DECIMAL(5,2),
    
    -- Control fields
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    
    -- Instructions and requirements
    instructions TEXT,
    requirements TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for routines
CREATE INDEX idx_routines_name ON routines(name);
CREATE INDEX idx_routines_category ON routines(category);
CREATE INDEX idx_routines_frequency ON routines(frequency);
CREATE INDEX idx_routines_priority ON routines(priority);
CREATE INDEX idx_routines_is_active ON routines(is_active);
CREATE INDEX idx_routines_is_template ON routines(is_template);
CREATE INDEX idx_routines_created_at ON routines(created_at);

-- 2. Create companies_routines table (links companies to their routines)
CREATE TABLE companies_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    
    -- Company-specific customizations
    custom_name TEXT,
    custom_description TEXT,
    custom_instructions TEXT,
    custom_frequency VARCHAR(20),
    custom_priority VARCHAR(20) CHECK (custom_priority IN ('low', 'medium', 'high', 'critical', NULL)),
    
    -- Assignment and responsibility
    assigned_to UUID REFERENCES users(id),
    assigned_team VARCHAR(100),
    
    -- Schedule settings
    start_date DATE,
    end_date DATE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    month_of_year INTEGER CHECK (month_of_year BETWEEN 1 AND 12),
    
    -- Execution tracking
    last_completed_at TIMESTAMPTZ,
    last_completed_by UUID REFERENCES users(id),
    completion_count INTEGER DEFAULT 0,
    
    -- Status and control
    is_active BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    pause_reason TEXT,
    
    -- Notifications
    notify_before_hours INTEGER DEFAULT 24,
    notify_on_overdue BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(company_id, routine_id)
);

-- Create indexes for companies_routines
CREATE INDEX idx_companies_routines_company_id ON companies_routines(company_id);
CREATE INDEX idx_companies_routines_routine_id ON companies_routines(routine_id);
CREATE INDEX idx_companies_routines_assigned_to ON companies_routines(assigned_to);
CREATE INDEX idx_companies_routines_is_active ON companies_routines(is_active);
CREATE INDEX idx_companies_routines_is_paused ON companies_routines(is_paused);
CREATE INDEX idx_companies_routines_start_date ON companies_routines(start_date);
CREATE INDEX idx_companies_routines_last_completed_at ON companies_routines(last_completed_at);
CREATE INDEX idx_companies_routines_created_at ON companies_routines(created_at);

-- Add comments for documentation
COMMENT ON TABLE routines IS 'Master table for all routine task definitions';
COMMENT ON TABLE companies_routines IS 'Links companies to their specific routine tasks with customizations';