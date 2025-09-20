-- ======================================
-- View: Cash Flow Indicators
-- ======================================
-- View para indicadores e métricas agregadas de fluxo de caixa

CREATE OR REPLACE VIEW cash_flow_indicators_view AS
SELECT 
    company_id,
    
    -- =========================
    -- INDICADORES GERAIS
    -- =========================
    
    -- Total de transações
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE type = 'receivable') as total_receivables,
    COUNT(*) FILTER (WHERE type = 'payable') as total_payables,
    COUNT(*) FILTER (WHERE status = 'paid') as total_paid,
    COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
    
    -- =========================
    -- VALORES REALIZADOS (PAGOS)
    -- =========================
    
    -- Entradas realizadas (recebidas)
    COALESCE(SUM(paid_amount) FILTER (WHERE type = 'receivable' AND status = 'paid'), 0) as realized_income,
    
    -- Saídas realizadas (pagas)
    COALESCE(SUM(paid_amount) FILTER (WHERE type = 'payable' AND status = 'paid'), 0) as realized_expenses,
    
    -- Saldo realizado (entradas - saídas)
    COALESCE(SUM(paid_amount) FILTER (WHERE type = 'receivable' AND status = 'paid'), 0) - 
    COALESCE(SUM(paid_amount) FILTER (WHERE type = 'payable' AND status = 'paid'), 0) as realized_balance,
    
    -- =========================
    -- VALORES PENDENTES
    -- =========================
    
    -- Entradas pendentes (a receber)
    COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending'), 0) as pending_income,
    
    -- Saídas pendentes (a pagar)
    COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending'), 0) as pending_expenses,
    
    -- Saldo pendente (a receber - a pagar)
    COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending'), 0) - 
    COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending'), 0) as pending_balance,
    
    -- =========================
    -- PROJEÇÃO DE SALDO TOTAL
    -- =========================
    
    -- Saldo total projetado (realizado + pendente)
    (COALESCE(SUM(paid_amount) FILTER (WHERE type = 'receivable' AND status = 'paid'), 0) - 
     COALESCE(SUM(paid_amount) FILTER (WHERE type = 'payable' AND status = 'paid'), 0)) +
    (COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending'), 0) - 
     COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending'), 0)) as projected_balance,
    
    -- =========================
    -- INDICADORES DE VENCIMENTO
    -- =========================
    
    -- Vencidos
    COUNT(*) FILTER (WHERE status = 'pending' AND due_date < CURRENT_DATE) as overdue_count,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending' AND due_date < CURRENT_DATE), 0) as overdue_amount,
    
    -- Vencem hoje
    COUNT(*) FILTER (WHERE status = 'pending' AND due_date = CURRENT_DATE) as due_today_count,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending' AND due_date = CURRENT_DATE), 0) as due_today_amount,
    
    -- Vencem em 7 dias
    COUNT(*) FILTER (WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as due_week_count,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'), 0) as due_week_amount,
    
    -- Vencem em 30 dias
    COUNT(*) FILTER (WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as due_month_count,
    COALESCE(SUM(value) FILTER (WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'), 0) as due_month_amount,
    
    -- =========================
    -- INDICADOR DE LIQUIDEZ
    -- =========================
    
    -- Liquidez corrente (a receber / a pagar) - valores pendentes
    CASE 
        WHEN COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending'), 0) = 0 THEN 999.99
        ELSE ROUND(
            COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending'), 0) / 
            COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending'), 1), 2
        )
    END as liquidity_ratio,
    
    -- =========================
    -- INDICADORES POR PERÍODO
    -- =========================
    
    -- Próximos 30 dias - saldo líquido
    COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'), 0) - 
    COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'), 0) as next_30_days_balance,
    
    -- Próximos 60 dias - saldo líquido
    COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'), 0) - 
    COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'), 0) as next_60_days_balance,
    
    -- Próximos 90 dias - saldo líquido
    COALESCE(SUM(value) FILTER (WHERE type = 'receivable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'), 0) - 
    COALESCE(SUM(value) FILTER (WHERE type = 'payable' AND status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'), 0) as next_90_days_balance,
    
    -- =========================
    -- CAMPOS ESPECIAIS
    -- =========================
    
    -- FAG - Agregações
    COUNT(*) FILTER (WHERE fag = true) as fag_true_count,
    COUNT(*) FILTER (WHERE fag = false) as fag_false_count,
    COUNT(*) FILTER (WHERE fag IS NULL) as fag_null_count,
    
    -- is_forecast - Agregações
    COUNT(*) FILTER (WHERE is_forecast = true) as forecast_count,
    COUNT(*) FILTER (WHERE is_forecast = false) as not_forecast_count,
    COUNT(*) FILTER (WHERE is_forecast IS NULL) as forecast_null_count,
    
    -- =========================
    -- MÉTRICAS DE VALIDAÇÃO
    -- =========================
    
    COUNT(*) FILTER (WHERE validated = true) as validated_count,
    COUNT(*) FILTER (WHERE validated = false OR validated IS NULL) as not_validated_count,
    
    -- Percentual de validação
    ROUND(
        (COUNT(*) FILTER (WHERE validated = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as validation_percentage,
    
    -- =========================
    -- TIMESTAMPS
    -- =========================
    
    MIN(due_date) as earliest_due_date,
    MAX(due_date) as latest_due_date,
    MAX(updated_at) as last_updated_at,
    CURRENT_TIMESTAMP as calculated_at

FROM financial_transactions

WHERE status != 'cancelled'
  AND company_id IS NOT NULL

GROUP BY company_id

ORDER BY company_id;

-- ======================================
-- View Simplificada para Indicadores Principais
-- ======================================

CREATE OR REPLACE VIEW cash_flow_summary_view AS
SELECT 
    company_id,
    
    -- Saldo atual realizado
    realized_balance,
    
    -- Projeção total
    projected_balance,
    
    -- Liquidez
    liquidity_ratio,
    
    -- Próximos vencimentos
    overdue_amount,
    due_today_amount,
    due_week_amount,
    due_month_amount,
    
    -- Próximos períodos
    next_30_days_balance,
    next_60_days_balance,
    next_90_days_balance,
    
    -- Totais
    pending_income,
    pending_expenses,
    
    -- Timestamp
    calculated_at

FROM cash_flow_indicators_view;

-- ======================================
-- Comentários
-- ======================================

COMMENT ON VIEW cash_flow_indicators_view IS 'View completa com todos os indicadores e métricas de fluxo de caixa por empresa';
COMMENT ON VIEW cash_flow_summary_view IS 'View resumida com indicadores principais de fluxo de caixa para headers e dashboards';