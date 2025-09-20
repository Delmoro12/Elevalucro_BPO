-- Migration: Drop duplicate procedure generate_recurring_receivable_accounts
-- Description: Remove procedure duplicada já que generate_recurring_accounts é universal

-- ======================================
-- Drop Duplicate Procedure
-- ======================================
-- A procedure generate_recurring_accounts já funciona para ambos os tipos
-- (payable e receivable) na tabela unificada financial_transactions

DROP FUNCTION IF EXISTS generate_recurring_receivable_accounts(UUID, VARCHAR, JSONB);

-- Adicionar comentário explicativo
COMMENT ON FUNCTION generate_recurring_accounts IS 'Gera transações recorrentes ou parceladas para ambos os tipos (payable/receivable) baseadas na configuração fornecida';