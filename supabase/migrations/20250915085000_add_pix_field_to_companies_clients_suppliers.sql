-- =============================================================================
-- Migration: Add PIX field to companies_clients_suppliers
-- Generated at: 2025-09-15 08:50:00
-- =============================================================================
-- Adiciona campo PIX à tabela companies_clients_suppliers

BEGIN;

-- Adicionar coluna PIX
ALTER TABLE companies_clients_suppliers 
ADD COLUMN IF NOT EXISTS pix TEXT;

-- Adicionar comentário
COMMENT ON COLUMN companies_clients_suppliers.pix IS 'Chave PIX para pagamentos';

COMMIT;