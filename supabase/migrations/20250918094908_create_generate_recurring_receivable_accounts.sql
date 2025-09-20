-- Função para gerar contas a receber recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_receivable_accounts(
    p_account_id UUID,
    p_occurrence_type VARCHAR,
    p_recurrence_config JSONB
)
RETURNS TABLE (
    account_id UUID,
    due_date DATE,
    installment_number INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_account accounts_receivable%ROWTYPE;
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
    SELECT * INTO v_account FROM accounts_receivable WHERE id = p_account_id;
    
    IF v_account IS NULL THEN
        RAISE EXCEPTION 'Conta não encontrada: %', p_account_id;
    END IF;
    
    -- Gerar UUID para a série
    v_series_id := gen_random_uuid();
    
    -- Atualizar a conta original com o series_id
    UPDATE accounts_receivable 
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
                
                INSERT INTO accounts_receivable (
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
                    series_id,
                    recurrence_config,
                    status
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
                    v_account.notes,
                    v_account.category_id,
                    p_occurrence_type,
                    v_series_id,
                    p_recurrence_config,
                    'pending'
                ) RETURNING id, v_due_date, NULL INTO account_id, due_date, installment_number;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'monthly' THEN
            -- Mensal - criar 12 ocorrências (1 ano)
            v_installment_count := 12;
            v_day_of_month := COALESCE((p_recurrence_config->>'day_of_month')::INTEGER, EXTRACT(DAY FROM v_account.due_date));
            
            FOR v_i IN 1..v_installment_count LOOP
                -- Calcular próxima data mantendo o dia do mês
                v_due_date := v_account.due_date + (v_i || ' months')::INTERVAL;
                
                -- Ajustar para o dia correto do mês (considerando meses com menos dias)
                BEGIN
                    v_due_date := DATE(
                        EXTRACT(YEAR FROM v_due_date) || '-' ||
                        EXTRACT(MONTH FROM v_due_date) || '-' ||
                        LEAST(v_day_of_month, 
                              EXTRACT(DAY FROM date_trunc('month', v_due_date) + INTERVAL '1 month' - INTERVAL '1 day'))
                    );
                EXCEPTION
                    WHEN OTHERS THEN
                        -- Se falhar, usar o último dia do mês
                        v_due_date := date_trunc('month', v_due_date) + INTERVAL '1 month' - INTERVAL '1 day';
                END;
                
                INSERT INTO accounts_receivable (
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
                    series_id,
                    recurrence_config,
                    status
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
                    v_account.notes,
                    v_account.category_id,
                    p_occurrence_type,
                    v_series_id,
                    p_recurrence_config,
                    'pending'
                ) RETURNING id, v_due_date, NULL INTO account_id, due_date, installment_number;
                
                RETURN NEXT;
            END LOOP;
            
        WHEN 'installments' THEN
            -- Parcelamento
            v_installment_count := COALESCE((p_recurrence_config->>'installment_count')::INTEGER, 2);
            
            FOR v_i IN 2..v_installment_count LOOP
                v_due_date := v_account.due_date + ((v_i - 1) || ' months')::INTERVAL;
                
                INSERT INTO accounts_receivable (
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
                    series_id,
                    recurrence_config,
                    installment_number,
                    installment_total,
                    status
                ) VALUES (
                    v_account.company_id,
                    v_account.pix_number,
                    v_account.bank_slip_code,
                    v_account.payment_method,
                    v_account.companies_clients_suppliers_id,
                    v_due_date,
                    v_account.value / v_installment_count, -- Dividir o valor pelo número de parcelas
                    v_account.date_of_issue,
                    v_account.number_of_document,
                    v_account.notes,
                    v_account.category_id,
                    p_occurrence_type,
                    v_series_id,
                    p_recurrence_config,
                    v_i,
                    v_installment_count,
                    'pending'
                ) RETURNING id, v_due_date, v_i INTO account_id, due_date, installment_number;
                
                RETURN NEXT;
            END LOOP;
            
            -- Atualizar a conta original com os dados de parcelamento
            UPDATE accounts_receivable
            SET installment_number = 1,
                installment_total = v_installment_count,
                value = v_account.value / v_installment_count
            WHERE id = p_account_id;
            
        ELSE
            -- Tipo não reconhecido ou 'unique'
            RETURN;
    END CASE;
    
    RETURN;
END;
$$;

-- Adicionar comentário
COMMENT ON FUNCTION generate_recurring_receivable_accounts IS 'Gera contas a receber recorrentes baseadas em uma conta original e configuração de recorrência';