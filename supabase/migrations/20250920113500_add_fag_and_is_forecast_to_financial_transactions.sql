-- ======================================
-- Migration: Add FAG and is_forecast fields to financial_transactions
-- Data: 2025-09-20
-- Descrição: Adiciona campos FAG e is_forecast para classificação de fluxo de caixa
-- ======================================

-- Adicionar novos campos à tabela financial_transactions
ALTER TABLE financial_transactions 
ADD COLUMN fag BOOLEAN DEFAULT NULL,
ADD COLUMN is_forecast BOOLEAN DEFAULT NULL;

-- Adicionar comentários aos novos campos
COMMENT ON COLUMN financial_transactions.fag IS 'Campo FAG para classificação específica de fluxo de caixa';
COMMENT ON COLUMN financial_transactions.is_forecast IS 'Indica se a transação é uma projeção/previsão para fluxo de caixa';

-- Log da alteração
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Added fag and is_forecast fields to financial_transactions table';
END $$;