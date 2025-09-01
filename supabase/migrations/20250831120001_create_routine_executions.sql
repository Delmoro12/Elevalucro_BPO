-- ======================================
-- Create routine_executions table for routine execution history
-- ======================================

CREATE TABLE IF NOT EXISTS routine_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to companies_routines
    company_routine_id UUID NOT NULL REFERENCES companies_routines(id) ON DELETE CASCADE,
    
    -- Execution details
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_by UUID REFERENCES users(id),
    
    -- Execution status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'partially_completed', 'failed')),
    
    -- Additional information
    notes TEXT,
    attachments TEXT[], -- Array of file URLs
    time_spent_minutes INTEGER,
    
    -- Next execution date (calculated automatically)
    next_execution_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_executions_company_routine_id ON routine_executions(company_routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_at ON routine_executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_routine_executions_executed_by ON routine_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_routine_executions_status ON routine_executions(status);
CREATE INDEX IF NOT EXISTS idx_routine_executions_next_execution_date ON routine_executions(next_execution_date);
CREATE INDEX IF NOT EXISTS idx_routine_executions_created_at ON routine_executions(created_at);

-- Add comments for documentation
COMMENT ON TABLE routine_executions IS 'History of routine executions for companies';
COMMENT ON COLUMN routine_executions.company_routine_id IS 'Reference to the company routine that was executed';
COMMENT ON COLUMN routine_executions.executed_at IS 'When the routine was executed';
COMMENT ON COLUMN routine_executions.executed_by IS 'User who executed the routine';
COMMENT ON COLUMN routine_executions.status IS 'Execution status: completed, partially_completed, failed';
COMMENT ON COLUMN routine_executions.notes IS 'Notes about the execution';
COMMENT ON COLUMN routine_executions.attachments IS 'Array of attachment URLs (documents, screenshots, etc)';
COMMENT ON COLUMN routine_executions.time_spent_minutes IS 'Time spent on execution in minutes';
COMMENT ON COLUMN routine_executions.next_execution_date IS 'Calculated date for next execution';