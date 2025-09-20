-- Migration: Add documents field to accounts_payable and accounts_receivable
-- Description: Adiciona campo JSONB para armazenar documentos anexados

-- ======================================
-- Add documents field to accounts_payable
-- ======================================

ALTER TABLE accounts_payable 
ADD COLUMN documents JSONB DEFAULT '[]';

-- Add comment for documents field in accounts_payable
COMMENT ON COLUMN accounts_payable.documents IS 'Array JSON com documentos anexados (PDF, imagens, etc)';

-- ======================================
-- Add documents field to accounts_receivable
-- ======================================

ALTER TABLE accounts_receivable 
ADD COLUMN documents JSONB DEFAULT '[]';

-- Add comment for documents field in accounts_receivable
COMMENT ON COLUMN accounts_receivable.documents IS 'Array JSON com documentos anexados (PDF, imagens, etc)';

-- ======================================
-- Optional: Add GIN index for documents field for faster JSON queries
-- ======================================

-- Uncomment if we need to search within documents JSON
-- CREATE INDEX IF NOT EXISTS idx_accounts_payable_documents ON accounts_payable USING GIN (documents);
-- CREATE INDEX IF NOT EXISTS idx_accounts_receivable_documents ON accounts_receivable USING GIN (documents);