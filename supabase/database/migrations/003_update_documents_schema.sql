-- Migration: Update documents table schema
-- Remove campos_faltantes, processed_at columns and update status values
-- Date: 2024-08-24

BEGIN;

-- Drop the index for campos_faltantes first
DROP INDEX IF EXISTS idx_documents_campos_faltantes;

-- Remove the campos_faltantes and processed_at columns
ALTER TABLE documents 
DROP COLUMN IF EXISTS campos_faltantes,
DROP COLUMN IF EXISTS processed_at;

-- Update status constraint to include new values
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_status_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_status_check 
CHECK (status IN ('pendente', 'processado', 'conciliado', 'erro'));

-- Update existing records with old status values to new ones
UPDATE documents 
SET status = 'erro' 
WHERE status = 'processando';

COMMIT;