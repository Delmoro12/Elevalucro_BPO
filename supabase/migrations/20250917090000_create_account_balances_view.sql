-- View para calcular saldos atuais das contas financeiras
CREATE OR REPLACE VIEW account_balances AS
SELECT 
    fa.company_id,
    fa.id as financial_account_id,
    fa.description as account_name,
    COALESCE(SUM(
        CASE 
            WHEN cm.type = 'credit' THEN cm.amount 
            ELSE -cm.amount 
        END
    ), 0) AS current_balance
FROM financial_accounts fa
LEFT JOIN cash_movements cm ON fa.id = cm.financial_account_id
GROUP BY fa.company_id, fa.id, fa.description
ORDER BY fa.company_id, fa.description;

-- Comentários
COMMENT ON VIEW account_balances IS 'Saldos atuais das contas financeiras por empresa';