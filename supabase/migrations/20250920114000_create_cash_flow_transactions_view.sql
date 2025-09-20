-- ======================================
-- Migration: Create Cash Flow Transactions View
-- Data: 2025-09-20
-- Descrição: Cria view para listagem detalhada do fluxo de caixa
-- ======================================

-- ======================================
-- View: Cash Flow Transactions
-- ======================================
-- View para listagem detalhada do fluxo de caixa
-- Ordena registros por data de vencimento com separação clara de débitos e créditos

CREATE OR REPLACE VIEW cash_flow_transactions_view AS
SELECT 
    ft.id,
    ft.company_id,
    ft.type,
    ft.created_by_side,
    
    -- Classificação para fluxo de caixa
    CASE 
        WHEN ft.type = 'receivable' THEN 'CRÉDITO'
        WHEN ft.type = 'payable' THEN 'DÉBITO'
        ELSE 'N/A'
    END as cash_flow_type,
    
    -- Informações básicas da transação
    ft.due_date,
    ft.date_of_issue,
    ft.value,
    ft.payment_date,
    ft.paid_amount,
    ft.status,
    ft.payment_method,
    
    -- Documentação
    ft.number_of_document,
    ft.notes as observacao,
    
    -- Dados de terceiros (fornecedor/cliente)
    COALESCE(ccs.name, 'N/A') as third_party_name,
    CASE 
        WHEN ft.type = 'payable' THEN COALESCE(ccs.name, 'N/A')
        ELSE NULL
    END as fornecedor_nome,
    
    CASE 
        WHEN ft.type = 'receivable' THEN COALESCE(ccs.name, 'N/A')
        ELSE NULL
    END as cliente_nome,
    
    COALESCE(ccs.cnpj, ccs.cpf, '') as third_party_document,
    ccs.type as third_party_type,
    
    -- Categoria financeira
    COALESCE(fc.description, 'Sem categoria') as category_name,
    fc.id as category_id,
    
    -- Grupo DRE
    COALESCE(dg.description, '') as dre_group_name,
    dg.sort_order as dre_group_order,
    
    -- Conta financeira
    COALESCE(fa.description, '') as financial_account_name,
    ft.financial_account_id,
    
    -- Campos específicos para fluxo de caixa
    ft.fag,
    ft.is_forecast,
    
    -- Status calculado para fluxo de caixa
    CASE 
        WHEN ft.status = 'paid' THEN 'REALIZADO'
        WHEN ft.due_date IS NULL THEN 'SEM_DATA'
        WHEN ft.due_date < CURRENT_DATE THEN 'VENCIDO'
        WHEN ft.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCE_EM_BREVE'
        ELSE 'A_VENCER'
    END as cash_flow_status,
    
    -- Dias até o vencimento (negativo se vencido)
    CASE 
        WHEN ft.due_date IS NULL THEN NULL
        WHEN ft.status = 'paid' THEN 0
        ELSE (ft.due_date - CURRENT_DATE)::INTEGER
    END as days_to_due,
    
    -- Valor para cálculo de fluxo (positivo para crédito, negativo para débito)
    CASE 
        WHEN ft.type = 'receivable' THEN 
            CASE WHEN ft.status = 'paid' THEN ft.paid_amount ELSE ft.value END
        WHEN ft.type = 'payable' THEN 
            CASE WHEN ft.status = 'paid' THEN -ft.paid_amount ELSE -ft.value END
        ELSE 0
    END as cash_flow_value,
    
    -- Valor realizado (apenas se pago)
    CASE 
        WHEN ft.status = 'paid' THEN
            CASE 
                WHEN ft.type = 'receivable' THEN ft.paid_amount
                WHEN ft.type = 'payable' THEN -ft.paid_amount
                ELSE 0
            END
        ELSE 0
    END as realized_value,
    
    -- Valor pendente (apenas se não pago)
    CASE 
        WHEN ft.status = 'pending' THEN
            CASE 
                WHEN ft.type = 'receivable' THEN ft.value
                WHEN ft.type = 'payable' THEN -ft.value
                ELSE 0
            END
        ELSE 0
    END as pending_value,
    
    -- Campos de validação BPO
    ft.validated,
    ft.validated_at,
    ft.validated_by,
    COALESCE(validator.raw_user_meta_data->>'full_name', validator.email, 'N/A') as validated_by_name,
    
    -- Formatação para frontend
    TO_CHAR(ft.value, 'FM999G999G999G990D00') as value_formatted,
    TO_CHAR(ft.due_date, 'DD/MM/YYYY') as due_date_formatted,
    TO_CHAR(ft.payment_date, 'DD/MM/YYYY') as payment_date_formatted,
    
    -- Campos de auditoria
    ft.created_at,
    ft.created_by,
    ft.updated_at,
    ft.updated_by

FROM financial_transactions ft

-- JOIN com terceiros (fornecedores/clientes)
LEFT JOIN companies_clients_suppliers ccs 
    ON ft.companies_clients_suppliers_id = ccs.id

-- JOIN com categorias financeiras
LEFT JOIN financial_categories fc 
    ON ft.category_id = fc.id

-- JOIN com grupos DRE através das categorias
LEFT JOIN dre_groups dg 
    ON fc.dre_groups_id = dg.id

-- JOIN com contas financeiras
LEFT JOIN financial_accounts fa 
    ON ft.financial_account_id = fa.id

-- JOIN com usuários para validação
LEFT JOIN auth.users validator 
    ON ft.validated_by = validator.id

-- Apenas registros não cancelados
WHERE ft.status != 'cancelled'

ORDER BY 
    -- Priorizar por status (realizados primeiro, depois por vencimento)
    CASE WHEN ft.status = 'paid' THEN 1 ELSE 2 END,
    ft.due_date ASC NULLS LAST,
    ft.created_at DESC;

-- ======================================
-- Comentários
-- ======================================

COMMENT ON VIEW cash_flow_transactions_view IS 'View detalhada para fluxo de caixa com registros ordenados por vencimento e separação de débitos/créditos';

-- Log da criação
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Created cash_flow_transactions_view';
END $$;