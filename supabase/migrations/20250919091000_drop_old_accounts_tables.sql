-- ======================================
-- Drop Old Accounts Tables
-- ======================================
-- Remove as tabelas antigas de accounts_payable e accounts_receivable
-- após migração para financial_transactions unificada

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_accounts_payable_updated_at ON accounts_payable;
DROP TRIGGER IF EXISTS trigger_update_accounts_receivable_updated_at ON accounts_receivable;

-- Drop functions
DROP FUNCTION IF EXISTS update_accounts_payable_updated_at();
DROP FUNCTION IF EXISTS update_accounts_receivable_updated_at();

-- Drop tables (CASCADE will drop dependent constraints and indexes)
DROP TABLE IF EXISTS accounts_payable CASCADE;
DROP TABLE IF EXISTS accounts_receivable CASCADE;

-- ======================================
-- Comentários
-- ======================================

-- NOTA: As tabelas accounts_payable e accounts_receivable foram 
-- substituídas pela tabela unificada financial_transactions.
-- 
-- Esta migration remove as tabelas antigas após confirmar que:
-- 1. Todos os dados foram migrados para financial_transactions
-- 2. Todas as views foram atualizadas para usar a nova estrutura
-- 3. Todas as APIs foram atualizadas para usar financial_transactions
-- 4. Todos os testes passaram com a nova estrutura