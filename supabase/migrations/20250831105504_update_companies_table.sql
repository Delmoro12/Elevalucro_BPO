-- ======================================
-- Update Companies Table
-- ======================================
-- 1. Fix subscription_plan values
-- 2. Remove trial_ends_at
-- 3. Add lifecycle_stage field

-- Start transaction
BEGIN;

-- 1. Add subscription_plan column if it doesn't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'controle';

-- 2. Update existing subscription_plan values if any (safe to run even if column is new)
UPDATE companies 
SET subscription_plan = 'controle' 
WHERE subscription_plan IS NULL OR subscription_plan IN ('free', 'basic', '');

UPDATE companies 
SET subscription_plan = 'gerencial' 
WHERE subscription_plan = 'premium';

UPDATE companies 
SET subscription_plan = 'avancado' 
WHERE subscription_plan = 'enterprise';

-- 3. Drop trial_ends_at column if exists
ALTER TABLE companies 
DROP COLUMN IF EXISTS trial_ends_at;

-- 4. Drop existing subscription_plan constraint to recreate with proper CHECK
ALTER TABLE companies 
DROP CONSTRAINT IF EXISTS companies_subscription_plan_check;

-- 5. Add new CHECK constraint for subscription_plan
ALTER TABLE companies 
ADD CONSTRAINT companies_subscription_plan_check 
CHECK (subscription_plan IN ('controle', 'gerencial', 'avancado'));

-- 6. Add lifecycle_stage column
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(20) DEFAULT 'onboarding' 
CHECK (lifecycle_stage IN ('onboarding', 'production'));

-- 7. Create index for the new column
CREATE INDEX IF NOT EXISTS idx_companies_lifecycle_stage ON companies(lifecycle_stage);

-- 8. Add comments for documentation
COMMENT ON COLUMN companies.subscription_plan IS 'Subscription plan: controle, gerencial, avancado';
COMMENT ON COLUMN companies.lifecycle_stage IS 'Company lifecycle stage: onboarding (initial setup) or production (active)';

-- 9. Update existing companies to production if they were created more than 30 days ago
UPDATE companies 
SET lifecycle_stage = 'production' 
WHERE created_at < (NOW() - INTERVAL '30 days');

COMMIT;

-- Add notification message
DO $$
BEGIN
  RAISE NOTICE 'Companies table updated successfully:';
  RAISE NOTICE '- subscription_plan values updated to: controle, gerencial, avancado';
  RAISE NOTICE '- trial_ends_at column removed';
  RAISE NOTICE '- lifecycle_stage column added (onboarding/production)';
END $$;