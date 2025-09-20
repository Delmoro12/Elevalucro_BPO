-- Migration: Drop financial_registers table
-- Description: Remove tabela financial_registers que foi substituída pelo uso direto de accounts_payable/receivable com campo validated

-- ======================================
-- Drop financial_registers table and related objects
-- ======================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_financial_registers_company_id;
DROP INDEX IF EXISTS idx_financial_registers_type;
DROP INDEX IF EXISTS idx_financial_registers_companies_clients_suppliers_id;
DROP INDEX IF EXISTS idx_financial_registers_category_id;
DROP INDEX IF EXISTS idx_financial_registers_due_date;
DROP INDEX IF EXISTS idx_financial_registers_created_at;
DROP INDEX IF EXISTS idx_financial_registers_status;
DROP INDEX IF EXISTS idx_financial_registers_parent_account_id;
DROP INDEX IF EXISTS idx_financial_registers_series_id;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_financial_registers_updated_at ON financial_registers;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_financial_registers_updated_at();

-- Drop table
DROP TABLE IF EXISTS financial_registers;

-- Note: Schema file should also be removed from schemas directory