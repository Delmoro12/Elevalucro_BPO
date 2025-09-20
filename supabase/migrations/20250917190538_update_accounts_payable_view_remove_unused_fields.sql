-- Update accounts_payable_view to remove references to unused fields
-- This prepares for removing the unused recurrence fields from the table

DROP VIEW IF EXISTS accounts_payable_summary CASCADE;
DROP VIEW IF EXISTS accounts_payable_view CASCADE;

CREATE OR REPLACE VIEW accounts_payable_view AS
SELECT 
    ap.id,
    ap.company_id,
    
    -- Informações básicas da conta
    ap.pix_number,
    ap.bank_slip_code,
    ap.payment_method,
    ap.companies_clients_suppliers_id,
    ap.due_date,
    ap.value,
    ap.date_of_issue,
    ap.number_of_document,
    ap.notes,
    ap.occurrence,
    ap.status,
    
    -- Campos de pagamento
    ap.payment_date,
    ap.paid_amount,
    ap.financial_account_id,
    
    -- Campos de recorrência (apenas os que existem)
    ap.parent_account_id,
    ap.series_id,
    ap.recurrence_config,
    
    -- Dados do fornecedor (com fallback para N/A)
    COALESCE(ccs.name, 'N/A') as supplier_name,
    COALESCE(ccs.email_billing, '') as supplier_email,
    COALESCE(ccs.cnpj, ccs.cpf, '') as supplier_document,
    ccs.type as supplier_type,
    COALESCE(ccs.phone, '') as supplier_phone,
    COALESCE(ccs.whatsapp, '') as supplier_whatsapp,
    COALESCE(ccs.pix, '') as supplier_pix,
    
    -- Dados da categoria financeira
    COALESCE(fc.description, 'Sem categoria') as category_name,
    fc.id as category_id,
    
    -- Grupo DRE (se existir)
    COALESCE(dg.description, '') as dre_group_name,
    dg.sort_order as dre_group_order,
    
    -- Status calculado baseado na data de vencimento
    CASE 
        WHEN ap.due_date IS NULL THEN 'sem_data'
        WHEN ap.due_date < CURRENT_DATE THEN 'vencida'
        WHEN ap.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'vence_em_breve'
        ELSE 'em_dia'
    END as status_vencimento,
    
    -- Dias até o vencimento (negativo se vencida)
    CASE 
        WHEN ap.due_date IS NULL THEN NULL
        ELSE (ap.due_date - CURRENT_DATE)::INTEGER
    END as dias_vencimento,
    
    -- Informações de formatação para o frontend
    TO_CHAR(ap.value, 'FM999G999G999G990D00') as value_formatted,
    TO_CHAR(ap.due_date, 'DD/MM/YYYY') as due_date_formatted,
    TO_CHAR(ap.date_of_issue, 'DD/MM/YYYY') as date_of_issue_formatted,
    TO_CHAR(ap.payment_date, 'DD/MM/YYYY') as payment_date_formatted,
    TO_CHAR(ap.paid_amount, 'FM999G999G999G990D00') as paid_amount_formatted,
    
    -- Campos de auditoria
    ap.created_at,
    ap.created_by,
    ap.updated_at,
    ap.updated_by,
    
    -- Informações do usuário que criou (opcional)
    creator.email as created_by_email,
    updater.email as updated_by_email,
    
    -- Resumo da conta para busca
    LOWER(
        COALESCE(ccs.name, '') || ' ' ||
        COALESCE(ap.number_of_document, '') || ' ' ||
        COALESCE(ap.notes, '') || ' ' ||
        COALESCE(fc.description, '') || ' ' ||
        COALESCE(ap.payment_method, '')
    ) as search_text

FROM accounts_payable ap

-- JOIN com fornecedores/clientes (LEFT JOIN para permitir contas sem fornecedor)
LEFT JOIN companies_clients_suppliers ccs 
    ON ap.companies_clients_suppliers_id = ccs.id

-- JOIN com categorias financeiras
LEFT JOIN financial_categories fc 
    ON ap.category_id = fc.id

-- JOIN com grupos DRE através das categorias
LEFT JOIN dre_groups dg 
    ON fc.dre_groups_id = dg.id

-- JOIN com usuários para auditoria
LEFT JOIN auth.users creator 
    ON ap.created_by = creator.id
LEFT JOIN auth.users updater 
    ON ap.updated_by = updater.id

ORDER BY 
    ap.due_date ASC,  -- Contas mais próximas do vencimento primeiro
    ap.created_at DESC;

COMMENT ON VIEW accounts_payable_view IS 'View completa das contas a pagar com dados enriquecidos - campos de recorrência removidos, usando apenas recurrence_config';

-- Recreate summary view
CREATE OR REPLACE VIEW accounts_payable_summary AS
SELECT 
    company_id,
    
    -- Contadores por status
    COUNT(*) as total_contas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vencida') as contas_vencidas,
    COUNT(*) FILTER (WHERE status_vencimento = 'vence_em_breve') as contas_vence_breve,
    COUNT(*) FILTER (WHERE status_vencimento = 'em_dia') as contas_em_dia,
    COUNT(*) FILTER (WHERE status_vencimento = 'sem_data') as contas_sem_data,
    
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
    COUNT(*) FILTER (WHERE payment_method = 'pix') as contas_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as contas_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as contas_transferencia,
    
    -- Data da última atualização
    MAX(updated_at) as ultima_atualizacao

FROM accounts_payable_view
GROUP BY company_id;

COMMENT ON VIEW accounts_payable_summary IS 'Resumo executivo das contas a pagar por empresa para dashboards - atualizada para nova view';