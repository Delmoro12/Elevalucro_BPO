-- ======================================
-- Function: Generate Recurring Financial Transactions
-- ======================================
-- Esta função gera transações financeiras recorrentes ou parceladas baseadas na configuração

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
    v_account financial_transactions%ROWTYPE;
    v_series_id UUID;
    v_due_date DATE;
    v_installment_count INTEGER;
    v_interval_days INTEGER;
    v_day_of_week INTEGER;
    v_day_of_month INTEGER;
    v_current_date DATE;
    v_i INTEGER;
BEGIN
    -- Buscar a transação original
    SELECT * INTO v_account FROM financial_transactions WHERE id = p_account_id;
    
    IF v_account IS NULL THEN
        RAISE EXCEPTION 'Transação não encontrada: %', p_account_id;
    END IF;
    
    -- Gerar UUID para a série
    v_series_id := gen_random_uuid();
    
    -- Atualizar a transação original com o series_id
    UPDATE financial_transactions 
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
            v_due_date := v_current_date + INTERVAL '7 days'; -- Primeira recorrência
            
            -- Gerar as contas semanais
            FOR v_i IN 1..v_installment_count LOOP
                INSERT INTO financial_transactions (
                    company_id,
                    type,
                    created_by_side,
                    value,
                    due_date,
                    date_of_issue,
                    payment_method,
                    status,
                    pix_number,
                    bank_slip_code,
                    companies_clients_suppliers_id,
                    category_id,
                    number_of_document,
                    notes,
                    occurrence,
                    recurrence_config,
                    parent_account_id,
                    series_id,
                    installment_number,
                    installment_total,
                    validated,
                    created_by
                ) VALUES (
                    v_account.company_id,
                    v_account.type,
                    v_account.created_by_side,
                    v_account.value,
                    v_due_date,
                    v_account.date_of_issue,
                    v_account.payment_method,
                    v_account.status,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.companies_clients_suppliers_id,
                    v_account.category_id,
                    v_account.number_of_document,
                    v_account.notes,
                    p_occurrence_type,
                    p_recurrence_config,
                    p_account_id,
                    v_series_id,
                    v_i,
                    v_installment_count,
                    v_account.validated,
                    v_account.created_by
                );
                
                v_due_date := v_due_date + (v_interval_days || ' days')::INTERVAL;
            END LOOP;
            
        WHEN 'biweekly' THEN
            -- Quinzenal - criar 26 ocorrências (1 ano)
            v_installment_count := 26;
            v_interval_days := 14;
            v_day_of_week := (p_recurrence_config->>'day_of_week')::INTEGER;
            
            -- Ajustar para o próximo dia da semana especificado
            v_current_date := v_account.due_date;
            WHILE EXTRACT(DOW FROM v_current_date) != v_day_of_week LOOP
                v_current_date := v_current_date + INTERVAL '1 day';
            END LOOP;
            v_due_date := v_current_date + INTERVAL '14 days'; -- Primeira recorrência
            
            -- Gerar as contas quinzenais
            FOR v_i IN 1..v_installment_count LOOP
                INSERT INTO financial_transactions (
                    company_id, type, created_by_side, value, due_date, date_of_issue, payment_method, status,
                    pix_number, bank_slip_code, companies_clients_suppliers_id, category_id, number_of_document,
                    notes, occurrence, recurrence_config, parent_account_id, series_id, installment_number,
                    installment_total, validated, created_by
                ) VALUES (
                    v_account.company_id, v_account.type, v_account.created_by_side, v_account.value, v_due_date,
                    v_account.date_of_issue, v_account.payment_method, v_account.status, v_account.pix_number,
                    v_account.bank_slip_code, v_account.companies_clients_suppliers_id, v_account.category_id,
                    v_account.number_of_document, v_account.notes, p_occurrence_type, p_recurrence_config,
                    p_account_id, v_series_id, v_i, v_installment_count, v_account.validated, v_account.created_by
                );
                
                v_due_date := v_due_date + (v_interval_days || ' days')::INTERVAL;
            END LOOP;
            
        WHEN 'monthly' THEN
            -- Mensal - criar 12 ocorrências (1 ano)
            v_installment_count := 12;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            -- Começar do próximo mês
            v_current_date := DATE_TRUNC('month', v_account.due_date) + INTERVAL '1 month';
            
            -- Ajustar para o dia do mês especificado
            IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                -- Se o dia não existir no mês, usar o último dia do mês
                v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
            ELSE
                v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
            END IF;
            
            -- Gerar as contas mensais
            FOR v_i IN 1..v_installment_count LOOP
                INSERT INTO financial_transactions (
                    company_id, type, created_by_side, value, due_date, date_of_issue, payment_method, status,
                    pix_number, bank_slip_code, companies_clients_suppliers_id, category_id, number_of_document,
                    notes, occurrence, recurrence_config, parent_account_id, series_id, installment_number,
                    installment_total, validated, created_by
                ) VALUES (
                    v_account.company_id, v_account.type, v_account.created_by_side, v_account.value, v_due_date,
                    v_account.date_of_issue, v_account.payment_method, v_account.status, v_account.pix_number,
                    v_account.bank_slip_code, v_account.companies_clients_suppliers_id, v_account.category_id,
                    v_account.number_of_document, v_account.notes, p_occurrence_type, p_recurrence_config,
                    p_account_id, v_series_id, v_i, v_installment_count, v_account.validated, v_account.created_by
                );
                
                -- Próximo mês
                v_current_date := DATE_TRUNC('month', v_due_date) + INTERVAL '1 month';
                IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                    v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
                ELSE
                    v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
                END IF;
            END LOOP;
            
        WHEN 'quarterly' THEN
            -- Trimestral - criar 4 ocorrências (1 ano)
            v_installment_count := 4;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            -- Começar do próximo trimestre
            v_current_date := DATE_TRUNC('month', v_account.due_date) + INTERVAL '3 months';
            
            -- Ajustar para o dia do mês especificado
            IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
            ELSE
                v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
            END IF;
            
            -- Gerar as contas trimestrais
            FOR v_i IN 1..v_installment_count LOOP
                INSERT INTO financial_transactions (
                    company_id, type, created_by_side, value, due_date, date_of_issue, payment_method, status,
                    pix_number, bank_slip_code, companies_clients_suppliers_id, category_id, number_of_document,
                    notes, occurrence, recurrence_config, parent_account_id, series_id, installment_number,
                    installment_total, validated, created_by
                ) VALUES (
                    v_account.company_id, v_account.type, v_account.created_by_side, v_account.value, v_due_date,
                    v_account.date_of_issue, v_account.payment_method, v_account.status, v_account.pix_number,
                    v_account.bank_slip_code, v_account.companies_clients_suppliers_id, v_account.category_id,
                    v_account.number_of_document, v_account.notes, p_occurrence_type, p_recurrence_config,
                    p_account_id, v_series_id, v_i, v_installment_count, v_account.validated, v_account.created_by
                );
                
                -- Próximo trimestre
                v_current_date := DATE_TRUNC('month', v_due_date) + INTERVAL '3 months';
                IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                    v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
                ELSE
                    v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
                END IF;
            END LOOP;
            
        WHEN 'semiannual' THEN
            -- Semestral - criar 2 ocorrências (1 ano)
            v_installment_count := 2;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            -- Começar do próximo semestre
            v_current_date := DATE_TRUNC('month', v_account.due_date) + INTERVAL '6 months';
            
            -- Ajustar para o dia do mês especificado
            IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
            ELSE
                v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
            END IF;
            
            -- Gerar as contas semestrais
            FOR v_i IN 1..v_installment_count LOOP
                INSERT INTO financial_transactions (
                    company_id, type, created_by_side, value, due_date, date_of_issue, payment_method, status,
                    pix_number, bank_slip_code, companies_clients_suppliers_id, category_id, number_of_document,
                    notes, occurrence, recurrence_config, parent_account_id, series_id, installment_number,
                    installment_total, validated, created_by
                ) VALUES (
                    v_account.company_id, v_account.type, v_account.created_by_side, v_account.value, v_due_date,
                    v_account.date_of_issue, v_account.payment_method, v_account.status, v_account.pix_number,
                    v_account.bank_slip_code, v_account.companies_clients_suppliers_id, v_account.category_id,
                    v_account.number_of_document, v_account.notes, p_occurrence_type, p_recurrence_config,
                    p_account_id, v_series_id, v_i, v_installment_count, v_account.validated, v_account.created_by
                );
                
                -- Próximo semestre
                v_current_date := DATE_TRUNC('month', v_due_date) + INTERVAL '6 months';
                IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                    v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
                ELSE
                    v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
                END IF;
            END LOOP;
            
        WHEN 'installments' THEN
            -- Parcelado - usar a quantidade específica de parcelas
            v_installment_count := COALESCE((p_recurrence_config->>'installment_count')::INTEGER, 2);
            v_day_of_month := COALESCE((p_recurrence_config->>'installment_day')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            -- Atualizar a conta original como primeira parcela
            UPDATE financial_transactions 
            SET installment_number = 1,
                installment_total = v_installment_count,
                parent_account_id = p_account_id,
                series_id = v_series_id
            WHERE id = p_account_id;
            
            -- Começar da próxima parcela
            v_current_date := DATE_TRUNC('month', v_account.due_date) + INTERVAL '1 month';
            
            -- Gerar as parcelas restantes
            FOR v_i IN 2..v_installment_count LOOP
                -- Ajustar para o dia especificado da parcela
                IF v_day_of_month > EXTRACT(DAY FROM (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day')) THEN
                    v_due_date := DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day';
                ELSE
                    v_due_date := DATE_TRUNC('month', v_current_date) + (v_day_of_month - 1 || ' days')::INTERVAL;
                END IF;
                
                INSERT INTO financial_transactions (
                    company_id, type, created_by_side, value, due_date, date_of_issue, payment_method, status,
                    pix_number, bank_slip_code, companies_clients_suppliers_id, category_id, number_of_document,
                    notes, occurrence, recurrence_config, parent_account_id, series_id, installment_number,
                    installment_total, validated, created_by
                ) VALUES (
                    v_account.company_id, v_account.type, v_account.created_by_side, v_account.value, v_due_date,
                    v_account.date_of_issue, v_account.payment_method, v_account.status, v_account.pix_number,
                    v_account.bank_slip_code, v_account.companies_clients_suppliers_id, v_account.category_id,
                    v_account.number_of_document, v_account.notes, p_occurrence_type, p_recurrence_config,
                    p_account_id, v_series_id, v_i, v_installment_count, v_account.validated, v_account.created_by
                );
                
                -- Próximo mês
                v_current_date := DATE_TRUNC('month', v_due_date) + INTERVAL '1 month';
            END LOOP;
        ELSE
            RAISE EXCEPTION 'Tipo de ocorrência não suportado: %', p_occurrence_type;
    END CASE;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_recurring_accounts IS 'Gera contas recorrentes ou parceladas baseadas na configuração fornecida';
