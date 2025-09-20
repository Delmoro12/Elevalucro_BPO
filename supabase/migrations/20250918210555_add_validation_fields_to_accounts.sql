-- Migration: Add validation fields to accounts_payable and accounts_receivable
-- Description: Adiciona campos de validação para controle de registros não validados

-- ======================================
-- Add validation fields to accounts_payable
-- ======================================

ALTER TABLE accounts_payable 
ADD COLUMN validated BOOLEAN DEFAULT FALSE,
ADD COLUMN validated_at TIMESTAMPTZ,
ADD COLUMN validated_by UUID REFERENCES users(id);

-- Add indexes for validation fields in accounts_payable
CREATE INDEX IF NOT EXISTS idx_accounts_payable_validated ON accounts_payable(validated);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_validated_at ON accounts_payable(validated_at);

-- Add comments for validation fields in accounts_payable
COMMENT ON COLUMN accounts_payable.validated IS 'Indica se a conta foi validada pelo BPO (false = aguardando validacao)';
COMMENT ON COLUMN accounts_payable.validated_at IS 'Data e hora da validacao pelo BPO';
COMMENT ON COLUMN accounts_payable.validated_by IS 'Usuario do BPO que validou a conta';

-- ======================================
-- Add validation fields to accounts_receivable
-- ======================================

ALTER TABLE accounts_receivable 
ADD COLUMN validated BOOLEAN DEFAULT FALSE,
ADD COLUMN validated_at TIMESTAMPTZ,
ADD COLUMN validated_by UUID REFERENCES users(id);

-- Add indexes for validation fields in accounts_receivable
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_validated ON accounts_receivable(validated);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_validated_at ON accounts_receivable(validated_at);

-- Add comments for validation fields in accounts_receivable
COMMENT ON COLUMN accounts_receivable.validated IS 'Indica se a conta foi validada pelo BPO (false = aguardando validacao)';
COMMENT ON COLUMN accounts_receivable.validated_at IS 'Data e hora da validacao pelo BPO';
COMMENT ON COLUMN accounts_receivable.validated_by IS 'Usuario do BPO que validou a conta';

-- ======================================
-- Update existing records to validated = TRUE
-- ======================================
-- Considerando que registros existentes já foram "validados" implicitamente

UPDATE accounts_payable SET validated = TRUE WHERE validated IS NULL OR validated = FALSE;
UPDATE accounts_receivable SET validated = TRUE WHERE validated IS NULL OR validated = FALSE;