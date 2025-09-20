-- ======================================
-- View: Financial Transactions Unified
-- ======================================
-- View unificada para transações financeiras (payable + receivable)

CREATE OR REPLACE VIEW financial_transactions_view AS
SELECT 
    ft.id,
    ft.company_id,
    ft.type,
    ft.created_by_side,
    
    -- Informações básicas da transação
    ft.pix_number,
    ft.bank_slip_code,
    ft.payment_method,
    ft.companies_clients_suppliers_id,
    ft.due_date,
    ft.value,
    ft.date_of_issue,
    ft.number_of_document,
    ft.notes,
    ft.occurrence,
    ft.status,
    
    -- Campos de pagamento/recebimento
    ft.payment_date,
    ft.paid_amount,
    ft.financial_account_id,
    
    -- Campos de recorrência
    ft.parent_account_id,
    ft.series_id,
    ft.recurrence_config,
    ft.installment_number,
    ft.installment_total,
    
    -- Campos de validação BPO
    ft.validated,
    ft.validated_at,
    ft.validated_by,
    
    -- Dados de terceiros (fornecedor/cliente) com nomenclatura dinâmica
    COALESCE(ccs.name, 'N/A') as third_party_name,
    COALESCE(ccs.email_billing, '') as third_party_email,
    COALESCE(ccs.cnpj, ccs.cpf, '') as third_party_document,
    ccs.type as third_party_type,
    COALESCE(ccs.phone, '') as third_party_phone,
    COALESCE(ccs.whatsapp, '') as third_party_whatsapp,
    COALESCE(ccs.pix, '') as third_party_pix,
    
    -- Aliases específicos para compatibilidade
    CASE 
        WHEN ft.type = 'payable' THEN COALESCE(ccs.name, 'N/A')
        ELSE NULL
    END as supplier_name,
    
    CASE 
        WHEN ft.type = 'receivable' THEN COALESCE(ccs.name, 'N/A')
        ELSE NULL
    END as client_name,
    
    -- Dados da categoria financeira
    COALESCE(fc.description, 'Sem categoria') as category_name,
    fc.id as category_id,
    
    -- Grupo DRE (se existir)
    COALESCE(dg.description, '') as dre_group_name,
    dg.sort_order as dre_group_order,
    
    -- Status calculado baseado na data de vencimento
    CASE 
        WHEN ft.due_date IS NULL THEN 'sem_data'
        WHEN ft.due_date < CURRENT_DATE THEN 'vencida'
        WHEN ft.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'vence_em_breve'
        ELSE 'em_dia'
    END as status_vencimento,
    
    -- Dias até o vencimento (negativo se vencida)
    CASE 
        WHEN ft.due_date IS NULL THEN NULL
        ELSE (ft.due_date - CURRENT_DATE)::INTEGER
    END as dias_vencimento,
    
    -- Informações de formatação para o frontend
    TO_CHAR(ft.value, 'FM999G999G999G990D00') as value_formatted,
    TO_CHAR(ft.due_date, 'DD/MM/YYYY') as due_date_formatted,
    TO_CHAR(ft.date_of_issue, 'DD/MM/YYYY') as date_of_issue_formatted,
    
    -- Labels dinâmicos baseados no tipo
    CASE 
        WHEN ft.type = 'payable' THEN 'Conta a Pagar'
        WHEN ft.type = 'receivable' THEN 'Conta a Receber'
        ELSE 'Transação'
    END as type_label,
    
    CASE 
        WHEN ft.type = 'payable' THEN 'Fornecedor'
        WHEN ft.type = 'receivable' THEN 'Cliente'
        ELSE 'Terceiro'
    END as third_party_label,
    
    -- Campos de auditoria
    ft.created_at,
    ft.created_by,
    ft.updated_at,
    ft.updated_by,
    
    -- Informações do usuário que criou (opcional)
    creator.email as created_by_email,
    updater.email as updated_by_email,
    validator.email as validated_by_email,
    
    -- Nome do usuário que validou
    COALESCE(validator.raw_user_meta_data->>'full_name', validator.email, 'N/A') as validated_by_name,
    
    -- Resumo da transação para busca
    LOWER(
        COALESCE(ccs.name, '') || ' ' ||
        COALESCE(ft.number_of_document, '') || ' ' ||
        COALESCE(ft.notes, '') || ' ' ||
        COALESCE(fc.description, '') || ' ' ||
        COALESCE(ft.payment_method, '') || ' ' ||
        ft.type
    ) as search_text

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

-- JOIN com usuários para auditoria
LEFT JOIN auth.users creator 
    ON ft.created_by = creator.id
LEFT JOIN auth.users updater 
    ON ft.updated_by = updater.id
LEFT JOIN auth.users validator 
    ON ft.validated_by = validator.id

ORDER BY 
    ft.due_date ASC,  -- Transações mais próximas do vencimento primeiro
    ft.created_at DESC;

-- ======================================
-- Views Específicas para Compatibilidade
-- ======================================

-- View específica para contas a pagar (compatibilidade)
CREATE OR REPLACE VIEW accounts_payable_view AS
SELECT 
    fv.*
FROM financial_transactions_view fv
WHERE fv.type = 'payable';

-- View específica para contas a receber (compatibilidade)
CREATE OR REPLACE VIEW accounts_receivable_view AS
SELECT 
    fv.*
FROM financial_transactions_view fv
WHERE fv.type = 'receivable';

-- ======================================
-- Views Resumidas para Dashboard
-- ======================================

-- Resumo unificado de transações financeiras
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
WHERE status = 'pending'  -- IMPORTANTE: Considerar apenas transações pendentes
  AND validated = true  -- FILTRO ADICIONADO: Apenas registros validados
GROUP BY company_id, type;

-- Resumo específico para contas a pagar (compatibilidade)
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

-- Resumo específico para contas a receber (compatibilidade)
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

-- ======================================
-- Comentários
-- ======================================

COMMENT ON VIEW financial_transactions_view IS 'View unificada para todas as transações financeiras com dados enriquecidos e campos dinâmicos';
COMMENT ON VIEW accounts_payable_view IS 'View de compatibilidade para contas a pagar usando a tabela unificada';
COMMENT ON VIEW accounts_receivable_view IS 'View de compatibilidade para contas a receber usando a tabela unificada';
COMMENT ON VIEW financial_transactions_summary IS 'Resumo unificado de transações financeiras por empresa e tipo';
COMMENT ON VIEW accounts_payable_summary IS 'Resumo de contas a pagar para compatibilidade com código existente';
COMMENT ON VIEW accounts_receivable_summary IS 'Resumo de contas a receber para compatibilidade com código existente';