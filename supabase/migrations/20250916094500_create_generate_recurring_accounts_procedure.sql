-- ======================================
-- Function: Generate Recurring Accounts Payable
-- ======================================
-- Esta função gera contas recorrentes ou parceladas baseadas na configuração

CREATE OR REPLACE FUNCTION generate_recurring_accounts(
    p_account_id UUID,
    p_occurrence_type VARCHAR(50),
    p_recurrence_config JSONB
) RETURNS TABLE (
    account_id UUID,
    due_date DATE,
    installment_number INTEGER
) AS $$
DECLARE
    v_account accounts_payable%ROWTYPE;
    v_series_id UUID;
    v_due_date DATE;
    v_installment_count INTEGER;
    v_interval_days INTEGER;
    v_day_of_week INTEGER;
    v_day_of_month INTEGER;
    v_current_date DATE;
    v_i INTEGER;
BEGIN
    -- Buscar a conta original
    SELECT * INTO v_account FROM accounts_payable WHERE id = p_account_id;
    
    IF v_account IS NULL THEN
        RAISE EXCEPTION 'Conta não encontrada: %', p_account_id;
    END IF;
    
    -- Gerar UUID para a série
    v_series_id := gen_random_uuid();
    
    -- Atualizar a conta original com o series_id
    UPDATE accounts_payable 
    SET series_id = v_series_id,
        recurrence_config = p_recurrence_config
    WHERE id = p_account_id;
    
    -- Processar baseado no tipo de ocorrência
    CASE p_occurrence_type
        WHEN 'weekly' THEN
            -- Semanal - criar 52 ocorrências (1 ano)
            v_installment_count := 52;
            v_interval_days := 7;
            v_day_of_week := (p_recurrence_config->>'day_of_week')::INTEGER;
            
            -- Ajustar para o próximo dia da semana especificado
            v_current_date := v_account.due_date;
            WHILE EXTRACT(DOW FROM v_current_date) != v_day_of_week LOOP
                v_current_date := v_current_date + INTERVAL '1 day';
            END LOOP;
            
            FOR v_i IN 1..v_installment_count LOOP
                v_due_date := v_current_date + (v_interval_days * v_i || ' days')::INTERVAL;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Recorrência ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'biweekly' THEN
            -- Quinzenal - criar 26 ocorrências (1 ano)
            v_installment_count := 26;
            v_interval_days := 14;
            
            FOR v_i IN 1..v_installment_count LOOP
                v_due_date := v_account.due_date + (v_interval_days * v_i || ' days')::INTERVAL;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Quinzenal ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'monthly' THEN
            -- Mensal - criar 12 ocorrências (1 ano)
            v_installment_count := 12;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            FOR v_i IN 1..v_installment_count LOOP
                -- Calcular próxima data mantendo o dia do mês
                v_due_date := (v_account.due_date + (v_i || ' months')::INTERVAL)::DATE;
                
                -- Ajustar para o dia correto do mês
                v_due_date := DATE_TRUNC('month', v_due_date) + ((v_day_of_month - 1) || ' days')::INTERVAL;
                
                -- Se o dia não existe no mês (ex: 31 em fevereiro), usar o último dia do mês
                IF EXTRACT(MONTH FROM v_due_date) != EXTRACT(MONTH FROM (v_due_date - INTERVAL '1 day' * (v_day_of_month - EXTRACT(DAY FROM v_due_date)))) THEN
                    v_due_date := DATE_TRUNC('month', v_due_date) + INTERVAL '1 month' - INTERVAL '1 day';
                END IF;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Mês ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'quarterly' THEN
            -- Trimestral - criar 4 ocorrências (1 ano)
            v_installment_count := 4;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            FOR v_i IN 1..v_installment_count LOOP
                v_due_date := (v_account.due_date + ((v_i * 3) || ' months')::INTERVAL)::DATE;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Trimestre ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'semiannual' THEN
            -- Semestral - criar 2 ocorrências (1 ano)
            v_installment_count := 2;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            FOR v_i IN 1..v_installment_count LOOP
                v_due_date := (v_account.due_date + ((v_i * 6) || ' months')::INTERVAL)::DATE;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Semestre ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'annual' THEN
            -- Anual - criar 3 ocorrências (3 anos)
            v_installment_count := 3;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            FOR v_i IN 1..v_installment_count LOOP
                v_due_date := (v_account.due_date + (v_i || ' years')::INTERVAL)::DATE;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes || ' (Ano ' || v_i || ')',
                    v_account.category_id,
                    p_occurrence_type,
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'installments' THEN
            -- Parcelada
            v_installment_count := (p_recurrence_config->>'installment_count')::INTEGER;
            v_day_of_month := COALESCE((p_recurrence_config->>'installment_day')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            -- Atualizar a conta original como parcela 1
            UPDATE accounts_payable 
            SET installment_number = 1,
                notes = v_account.notes || ' (Parcela 1/' || v_installment_count || ')'
            WHERE id = p_account_id;
            
            -- Criar as parcelas restantes
            FOR v_i IN 2..v_installment_count LOOP
                -- Calcular data da parcela
                v_due_date := (v_account.due_date + ((v_i - 1) || ' months')::INTERVAL)::DATE;
                
                -- Ajustar para o dia correto
                v_due_date := DATE_TRUNC('month', v_due_date) + ((v_day_of_month - 1) || ' days')::INTERVAL;
                
                INSERT INTO accounts_payable (
                    company_id,
                    pix_number,
                    bank_slip_code,
                    payment_method,
                    companies_clients_suppliers_id,
                    due_date,
                    value,
                    date_of_issue,
                    number_of_document,
                    notes,
                    category_id,
                    occurrence,
                    status,
                    parent_account_id,
                    series_id,
                    recurrence_config,
                    installment_number,
                    created_by,
                    created_at
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value,
                    v_account.date_of_issue,
                    v_account.number_of_document || '/' || v_i,
                    v_account.notes || ' (Parcela ' || v_i || '/' || v_installment_count || ')',
                    v_account.category_id,
                    'installments',
                    'pending',
                    p_account_id,
                    v_series_id,
                    p_recurrence_config,
                    v_i,
                    v_account.created_by,
                    NOW()
                ) RETURNING id INTO account_id;
                
                RETURN NEXT;
            END LOOP;
            
        ELSE
            -- Tipo único, não gera recorrência
            NULL;
    END CASE;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_recurring_accounts IS 'Gera contas recorrentes ou parceladas baseadas na configuração fornecida';