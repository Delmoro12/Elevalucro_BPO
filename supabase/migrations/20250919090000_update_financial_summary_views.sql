-- ======================================
-- Update Financial Summary Views
-- ======================================
-- Add missing fields for API compatibility

-- Drop existing views first
DROP VIEW IF EXISTS accounts_receivable_summary CASCADE;
DROP VIEW IF EXISTS accounts_payable_summary CASCADE;

-- Recreate accounts_receivable_summary view
CREATE OR REPLACE VIEW accounts_receivable_summary AS
SELECT 
    company_id,
    
    -- Contadores totais
    COUNT(*) as total_contas,
    COUNT(*) FILTER (WHERE status = 'pending') as contas_pendentes,
    COUNT(*) FILTER (WHERE status = 'paid') as contas_recebidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vencida' AND status = 'pending') as contas_vencidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vence_em_breve' AND status = 'pending') as contas_vence_breve,
    
    -- Valores totais
    COALESCE(SUM(value), 0) as valor_total,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending'), 0) as valor_pendente,
    COALESCE(SUM(paid_amount) FILTER (WHERE status = 'paid'), 0) as valor_recebido,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vencida' AND status = 'pending'), 0) as valor_vencido,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vence_em_breve' AND status = 'pending'), 0) as valor_vence_breve,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'em_dia' AND status = 'pending'), 0) as valor_em_dia,
    
    -- Compatibilidade com estrutura antiga
    COUNT(*) FILTER (WHERE payment_method = 'pix') as contas_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as contas_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as contas_transferencia,
    
    -- Data da última atualização
    MAX(updated_at) as ultima_atualizacao

FROM financial_transactions_view
WHERE type = 'receivable'
GROUP BY company_id;

-- Recreate accounts_payable_summary view
CREATE OR REPLACE VIEW accounts_payable_summary AS
SELECT 
    company_id,
    
    -- Contadores totais
    COUNT(*) as total_contas,
    COUNT(*) FILTER (WHERE status = 'pending') as contas_pendentes,
    COUNT(*) FILTER (WHERE status = 'paid') as contas_pagas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vencida' AND status = 'pending') as contas_vencidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vence_em_breve' AND status = 'pending') as contas_vence_breve,
    COUNT(*) FILTER (WHERE status_vencimento = 'em_dia' AND status = 'pending') as contas_em_dia,
    COUNT(*) FILTER (WHERE status_vencimento = 'sem_data' AND status = 'pending') as contas_sem_data,
    
    -- Valores totais
    COALESCE(SUM(value), 0) as valor_total,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending'), 0) as valor_pendente,
    COALESCE(SUM(paid_amount) FILTER (WHERE status = 'paid'), 0) as valor_pago,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vencida' AND status = 'pending'), 0) as valor_vencido,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vence_em_breve' AND status = 'pending'), 0) as valor_vence_breve,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'em_dia' AND status = 'pending'), 0) as valor_em_dia,
    
    -- Média de valores
    ROUND(AVG(value), 2) as valor_medio,
    
    -- Compatibilidade com estrutura antiga
    COUNT(*) FILTER (WHERE payment_method = 'pix') as contas_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as contas_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as contas_transferencia,
    
    -- Data da última atualização
    MAX(updated_at) as ultima_atualizacao

FROM financial_transactions_view
WHERE type = 'payable'
GROUP BY company_id;

-- ======================================
-- Comentários
-- ======================================

COMMENT ON VIEW accounts_receivable_summary IS 'Resumo de contas a receber com campos completos para API';
COMMENT ON VIEW accounts_payable_summary IS 'Resumo de contas a pagar com campos completos para API';