-- =============================================
-- Migration: Add validated = true filter to summary views
-- =============================================

-- Atualizar accounts_receivable_summary para considerar apenas registros validados
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
  AND validated = true  -- FILTRO ADICIONADO: Apenas registros validados
GROUP BY company_id;

-- Atualizar accounts_payable_summary para considerar apenas registros validados
CREATE OR REPLACE VIEW accounts_payable_summary AS
SELECT 
    company_id,
    total_transacoes as total_contas,
    transacoes_vencidas as contas_vencidas,
    transacoes_vence_breve as contas_vence_breve,
    transacoes_em_dia as contas_em_dia,
    transacoes_sem_data as contas_sem_data,
    valor_total,
    valor_vencido,
    valor_vence_breve,
    valor_em_dia,
    proximo_vencimento,
    valor_medio,
    transacoes_pix as contas_pix,
    transacoes_boleto as contas_boleto,
    transacoes_transferencia as contas_transferencia,
    ultima_atualizacao
FROM financial_transactions_summary
WHERE type = 'payable' 
  AND company_id IN (
    SELECT DISTINCT company_id 
    FROM financial_transactions_view 
    WHERE type = 'payable' AND validated = true  -- FILTRO ADICIONADO: Apenas registros validados
  );

-- Atualizar financial_transactions_summary para considerar apenas registros validados  
CREATE OR REPLACE VIEW financial_transactions_summary AS
SELECT 
    company_id,
    type,
    
    -- Contadores por status
    COUNT(*) as total_transacoes,
    COUNT(*) FILTER (WHERE status_vencimento = 'vencida') as transacoes_vencidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vence_em_breve') as transacoes_vence_breve,
    COUNT(*) FILTER (WHERE status_vencimento = 'em_dia') as transacoes_em_dia,
    COUNT(*) FILTER (WHERE status_vencimento = 'sem_data') as transacoes_sem_data,
    
    -- Valores por status
    COALESCE(SUM(value), 0) as valor_total,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vencida'), 0) as valor_vencido,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'vence_em_breve'), 0) as valor_vence_breve,
    COALESCE(SUM(value) FILTER (WHERE status_vencimento = 'em_dia'), 0) as valor_em_dia,
    
    -- Próximo vencimento
    MIN(due_date) FILTER (WHERE due_date >= CURRENT_DATE) as proximo_vencimento,
    
    -- Média de valores
    ROUND(AVG(value), 2) as valor_medio,
    
    -- Contadores por método de pagamento
    COUNT(*) FILTER (WHERE payment_method = 'pix') as transacoes_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as transacoes_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as transacoes_transferencia,
    
    -- Contadores por origem
    COUNT(*) FILTER (WHERE created_by_side = 'bpo_side') as criadas_bpo,
    COUNT(*) FILTER (WHERE created_by_side = 'client_side') as criadas_cliente,
    
    -- Contadores por validação
    COUNT(*) FILTER (WHERE validated = true) as transacoes_validadas,
    COUNT(*) FILTER (WHERE validated = false OR validated IS NULL) as transacoes_nao_validadas,
    
    -- Data da última atualização
    MAX(updated_at) as ultima_atualizacao

FROM financial_transactions_view
WHERE status = 'pending'  
  AND validated = true  -- FILTRO ADICIONADO: Apenas registros validados
GROUP BY company_id, type;