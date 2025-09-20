-- Corrigir view accounts_payable_summary para considerar apenas contas pendentes
CREATE OR REPLACE VIEW accounts_payable_summary AS
SELECT 
    company_id,
    COUNT(*) as total_contas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vencida') as contas_vencidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vence_em_breve') as contas_vence_breve,
    COUNT(*) FILTER (WHERE status_vencimento = 'em_dia') as contas_em_dia,
    COUNT(*) FILTER (WHERE status_vencimento = 'sem_data') as contas_sem_data,
    COALESCE(SUM(value), 0) as valor_total,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vencida'), 0) as valor_vencido,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vence_em_breve'), 0) as valor_vence_breve,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'em_dia'), 0) as valor_em_dia,
    MIN(due_date) FILTER (WHERE due_date >= CURRENT_DATE) as proximo_vencimento,
    ROUND(AVG(value), 2) as valor_medio,
    COUNT(*) FILTER (WHERE payment_method = 'pix') as contas_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as contas_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as contas_transferencia,
    MAX(updated_at) as ultima_atualizacao
FROM accounts_payable_view
WHERE status = 'pending'  -- IMPORTANTE: Considerar apenas contas pendentes
GROUP BY company_id;

-- Adicionar comentário explicativo
COMMENT ON VIEW accounts_payable_summary IS 'Resumo de contas a pagar PENDENTES por empresa com métricas de vencimento';