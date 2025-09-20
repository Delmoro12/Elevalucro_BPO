-- Função para processar pagamento de conta (transacional)
CREATE OR REPLACE FUNCTION process_account_payment(
    p_account_id UUID,
    p_financial_account_id UUID,
    p_payment_date DATE,
    p_paid_amount DECIMAL(15,2),
    p_notes TEXT DEFAULT NULL,
    p_supplier_name TEXT DEFAULT 'Fornecedor',
    p_document_number VARCHAR(100) DEFAULT NULL,
    p_account_notes TEXT DEFAULT NULL,
    p_company_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
    v_movement_id UUID;
    v_description TEXT;
BEGIN
    -- Construir descrição da movimentação
    v_description := 'Pagamento';
    
    IF p_supplier_name IS NOT NULL AND p_supplier_name != '' THEN
        v_description := v_description || ' - ' || p_supplier_name;
    END IF;
    
    IF p_document_number IS NOT NULL AND p_document_number != '' THEN
        v_description := v_description || ' - Doc: ' || p_document_number;
    END IF;
    
    IF p_account_notes IS NOT NULL AND p_account_notes != '' THEN
        v_description := v_description || ' - ' || p_account_notes;
    END IF;
    
    -- Limitar tamanho da descrição
    v_description := LEFT(v_description, 500);
    
    -- 1. Atualizar a conta a pagar
    UPDATE accounts_payable
    SET 
        status = 'paid',
        payment_date = p_payment_date,
        paid_amount = p_paid_amount,
        financial_account_id = p_financial_account_id,
        notes = CASE 
            WHEN p_notes IS NOT NULL AND p_notes != '' 
            THEN COALESCE(notes || E'\n\nPagamento: ', 'Pagamento: ') || p_notes
            ELSE notes
        END,
        updated_at = NOW()
    WHERE id = p_account_id;
    
    -- Verificar se a atualização foi bem-sucedida
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta não encontrada: %', p_account_id;
    END IF;
    
    -- 2. Criar movimentação financeira
    INSERT INTO cash_movements (
        company_id,
        financial_account_id,
        amount,
        type,
        description,
        reference_type,
        reference_id,
        date,
        created_at
    ) VALUES (
        p_company_id,
        p_financial_account_id,
        p_paid_amount,
        'debit',
        v_description,
        'account_payment',
        p_account_id,
        p_payment_date,
        NOW()
    ) RETURNING id INTO v_movement_id;
    
    -- Buscar dados atualizados da conta para retornar
    SELECT row_to_json(ap.*) INTO v_result
    FROM accounts_payable ap
    WHERE ap.id = p_account_id;
    
    -- Adicionar ID da movimentação ao resultado
    v_result := v_result || jsonb_build_object('movement_id', v_movement_id);
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, fazer rollback automático
        RAISE;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION process_account_payment IS 'Processa o pagamento de uma conta, atualizando status e criando movimentação financeira de forma transacional';