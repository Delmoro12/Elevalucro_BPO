-- Remove unused recurrence fields from accounts_payable table
-- These fields are not being used as data is stored in recurrence_config JSONB

-- Remove the fields that are always NULL and unused
ALTER TABLE accounts_payable 
DROP COLUMN IF EXISTS installment_number,
DROP COLUMN IF EXISTS installment_total,
DROP COLUMN IF EXISTS recurrence_day_of_week,
DROP COLUMN IF EXISTS recurrence_day_of_month;

-- Drop related indexes if they exist
DROP INDEX IF EXISTS idx_accounts_payable_installment_number;
DROP INDEX IF EXISTS idx_accounts_payable_installment_total;
DROP INDEX IF EXISTS idx_accounts_payable_recurrence_day_of_week;
DROP INDEX IF EXISTS idx_accounts_payable_recurrence_day_of_month;

-- Add comment
COMMENT ON TABLE accounts_payable IS 'Contas a pagar da empresa - campos de recorrência removidos, usando apenas recurrence_config JSONB';