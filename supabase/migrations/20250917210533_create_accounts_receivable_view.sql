-- ======================================
-- View: Accounts Receivable Dashboard
-- ======================================
-- View completa para contas a receber com dados enriquecidos

CREATE OR REPLACE VIEW accounts_receivable_view AS
SELECT 
    ar.id,
    ar.company_id,
    
    -- Informações básicas da conta
    ar.pix_number,
    ar.bank_slip_code,
    ar.payment_method,
    ar.companies_clients_suppliers_id,
    ar.due_date,
    ar.value,
    ar.date_of_issue,
    ar.number_of_document,
    ar.notes,
    ar.occurrence,
    ar.status,
    
    -- Campos de recebimento
    ar.receipt_date,
    ar.received_amount,
    ar.financial_account_id,
    
    -- Campos de recorrência
    ar.parent_account_id,
    ar.series_id,
    ar.recurrence_config,
    ar.installment_number,
    ar.installment_total,
    ar.installment_day,
    ar.recurrence_day_of_week,
    ar.recurrence_day_of_month,
    
    -- Dados do cliente (com fallback para N/A)
    COALESCE(ccs.name, 'N/A') as client_name,
    COALESCE(ccs.email_billing, '') as client_email,
    COALESCE(ccs.cnpj, ccs.cpf, '') as client_document,
    ccs.type as client_type,
    COALESCE(ccs.phone, '') as client_phone,
    COALESCE(ccs.whatsapp, '') as client_whatsapp,
    COALESCE(ccs.pix, '') as client_pix,
    
    -- Dados da categoria financeira
    COALESCE(fc.description, 'Sem categoria') as category_name,
    fc.id as category_id,
    
    -- Grupo DRE (se existir)
    COALESCE(dg.description, '') as dre_group_name,
    dg.sort_order as dre_group_order,
    
    -- Status calculado baseado na data de vencimento
    CASE 
        WHEN ar.due_date IS NULL THEN 'sem_data'
        WHEN ar.due_date < CURRENT_DATE THEN 'vencida'
        WHEN ar.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'vence_em_breve'
        ELSE 'em_dia'
    END as status_vencimento,
    
    -- Dias até o vencimento (negativo se vencida)
    CASE 
        WHEN ar.due_date IS NULL THEN NULL
        ELSE (ar.due_date - CURRENT_DATE)::INTEGER
    END as dias_vencimento,
    
    -- Informações de formatação para o frontend
    TO_CHAR(ar.value, 'FM999G999G999G990D00') as value_formatted,
    TO_CHAR(ar.due_date, 'DD/MM/YYYY') as due_date_formatted,
    TO_CHAR(ar.date_of_issue, 'DD/MM/YYYY') as date_of_issue_formatted,
    
    -- Campos de auditoria
    ar.created_at,
    ar.created_by,
    ar.updated_at,
    ar.updated_by,
    
    -- Informações do usuário que criou (opcional)
    creator.email as created_by_email,
    updater.email as updated_by_email,
    
    -- Resumo da conta para busca
    LOWER(
        COALESCE(ccs.name, '') || ' ' ||
        COALESCE(ar.number_of_document, '') || ' ' ||
        COALESCE(ar.notes, '') || ' ' ||
        COALESCE(fc.description, '') || ' ' ||
        COALESCE(ar.payment_method, '')
    ) as search_text

FROM accounts_receivable ar

-- JOIN com clientes (LEFT JOIN para permitir contas sem cliente)
LEFT JOIN companies_clients_suppliers ccs 
    ON ar.companies_clients_suppliers_id = ccs.id

-- JOIN com categorias financeiras
LEFT JOIN financial_categories fc 
    ON ar.category_id = fc.id

-- JOIN com grupos DRE através das categorias
LEFT JOIN dre_groups dg 
    ON fc.dre_groups_id = dg.id

-- JOIN com usuários para auditoria
LEFT JOIN auth.users creator 
    ON ar.created_by = creator.id
LEFT JOIN auth.users updater 
    ON ar.updated_by = updater.id

-- Filtrar apenas contas ativas (se houver campo de soft delete no futuro)
-- WHERE ar.is_active = true

ORDER BY 
    ar.due_date ASC,  -- Contas mais próximas do vencimento primeiro
    ar.created_at DESC;

-- ======================================
-- View Resumida para Dashboard
-- ======================================

CREATE OR REPLACE VIEW accounts_receivable_summary AS
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
    
    -- Contadores por método de recebimento
    COUNT(*) FILTER (WHERE payment_method = 'pix') as contas_pix,
    COUNT(*) FILTER (WHERE payment_method = 'bank_slip') as contas_boleto,
    COUNT(*) FILTER (WHERE payment_method = 'bank_transfer') as contas_transferencia,
    
    -- Data da última atualização
    MAX(updated_at) as ultima_atualizacao

FROM accounts_receivable_view
GROUP BY company_id;

-- ======================================
-- Comentários das Views
-- ======================================

COMMENT ON VIEW accounts_receivable_view IS 'View completa das contas a receber com dados enriquecidos de clientes, categorias e status calculados';
COMMENT ON VIEW accounts_receivable_summary IS 'Resumo executivo das contas a receber por empresa para dashboards';