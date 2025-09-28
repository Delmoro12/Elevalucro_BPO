-- Migration: Add leads functionality fields to prospects table
-- Description: Adds kanban_stage, status, salesperson, temperature, additional contacts and audit fields

-- Rename existing status column to kanban_stage
ALTER TABLE prospects RENAME COLUMN status TO kanban_stage;

-- Set default value for kanban_stage
ALTER TABLE prospects ALTER COLUMN kanban_stage SET DEFAULT 'new';

-- Add new status column for lead/prospect differentiation
ALTER TABLE prospects ADD COLUMN status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'prospect'));

-- Add salesperson and temperature fields
ALTER TABLE prospects ADD COLUMN assigned_salesperson_id UUID REFERENCES users(id);
ALTER TABLE prospects ADD COLUMN temperature VARCHAR(20) DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot'));

-- Add additional contact fields
ALTER TABLE prospects ADD COLUMN additional_contact_email VARCHAR(255);
ALTER TABLE prospects ADD COLUMN additional_contact_phone VARCHAR(20);

-- Add lead source field
ALTER TABLE prospects ADD COLUMN lead_source VARCHAR(50);

-- Add audit fields
ALTER TABLE prospects ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE prospects ADD COLUMN updated_by UUID REFERENCES users(id);

-- Create indexes for new columns
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_kanban_stage ON prospects(kanban_stage);
CREATE INDEX idx_prospects_assigned_salesperson_id ON prospects(assigned_salesperson_id);
CREATE INDEX idx_prospects_temperature ON prospects(temperature);
CREATE INDEX idx_prospects_lead_source ON prospects(lead_source);

-- Add comments for documentation
COMMENT ON COLUMN prospects.status IS 'Stage in the sales funnel: lead or prospect';
COMMENT ON COLUMN prospects.kanban_stage IS 'Kanban stage for organizing leads/prospects';
COMMENT ON COLUMN prospects.assigned_salesperson_id IS 'ID of the salesperson responsible for this lead/prospect';
COMMENT ON COLUMN prospects.temperature IS 'Interest level: cold, warm, or hot';
COMMENT ON COLUMN prospects.additional_contact_email IS 'Additional contact email';
COMMENT ON COLUMN prospects.additional_contact_phone IS 'Additional contact phone';
COMMENT ON COLUMN prospects.lead_source IS 'Source where the lead came from';
COMMENT ON COLUMN prospects.created_by IS 'User ID who created this record';
COMMENT ON COLUMN prospects.updated_by IS 'User ID who last updated this record';