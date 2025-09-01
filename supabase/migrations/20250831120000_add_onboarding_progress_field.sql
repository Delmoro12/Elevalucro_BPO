-- ======================================
-- Add onboarding_progress field to companies
-- ======================================

-- Add onboarding_progress field
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS onboarding_progress INTEGER DEFAULT 0 
CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100);

-- Create index for the new field
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_progress ON companies(onboarding_progress);

-- Add comment
COMMENT ON COLUMN companies.onboarding_progress IS 'Onboarding completion percentage (0-100%)';

-- Update existing companies to have 0% progress
UPDATE companies SET onboarding_progress = 0 WHERE onboarding_progress IS NULL;