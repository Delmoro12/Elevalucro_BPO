-- Função para estornar transação financeira (transacional)
CREATE OR REPLACE FUNCTION reverse_financial_transaction(
    p_transaction_id UUID,
    p_transaction_type VARCHAR(50)
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
    v_transaction_status VARCHAR(50);
    v_deleted_movements INTEGER;
    v_reference_type VARCHAR(50);
BEGIN
    -- Verificar se a transação existe e está paga/recebida
    SELECT status INTO v_transaction_status
    FROM financial_transactions
    WHERE id = p_transaction_id
      AND type = p_transaction_type;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transação não encontrada: %', p_transaction_id;
    END IF;
    
    IF v_transaction_status != 'paid' THEN
        RAISE EXCEPTION 'Transação não está paga/recebida, status atual: %', v_transaction_status;
    END IF;
    
    -- Definir o tipo de referência baseado no tipo da transação
    IF p_transaction_type = 'payable' THEN
        v_reference_type := 'account_payment';
    ELSIF p_transaction_type = 'receivable' THEN
        v_reference_type := 'account_receipt';
    ELSE
        RAISE EXCEPTION 'Tipo de transação inválido: %', p_transaction_type;
    END IF;
    
    -- 1. Deletar movimentações financeiras relacionadas
    DELETE FROM cash_movements
    WHERE reference_type = v_reference_type
      AND reference_id = p_transaction_id;
    
    GET DIAGNOSTICS v_deleted_movements = ROW_COUNT;
    
    -- Log de quantas movimentações foram deletadas
    IF v_deleted_movements > 0 THEN
        RAISE NOTICE 'Deletadas % movimentações financeiras', v_deleted_movements;
    END IF;
    
    -- 2. Reverter a transação para status pending
    UPDATE financial_transactions
    SET 
        status = 'pending',
        payment_date = NULL,
        paid_amount = NULL,
        financial_account_id = NULL,
        updated_at = NOW()
    WHERE id = p_transaction_id
      AND type = p_transaction_type;
    
    -- Buscar dados atualizados da transação para retornar
    SELECT row_to_json(ft.*) INTO v_result
    FROM financial_transactions ft
    WHERE ft.id = p_transaction_id;
    
    -- Adicionar informação sobre movimentações deletadas
    v_result := v_result || jsonb_build_object('movements_deleted', v_deleted_movements);
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, fazer rollback automático
        RAISE;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION reverse_financial_transaction IS 'Estorna o pagamento/recebimento de uma transação financeira, revertendo status e deletando movimentações financeiras relacionadas de forma transacional';