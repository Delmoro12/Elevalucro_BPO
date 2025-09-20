-- Função para estornar pagamento de conta (transacional)
CREATE OR REPLACE FUNCTION reverse_account_payment(
    p_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
    v_account_status VARCHAR(50);
    v_deleted_movements INTEGER;
BEGIN
    -- Verificar se a conta existe e está paga
    SELECT status INTO v_account_status
    FROM accounts_payable
    WHERE id = p_account_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta não encontrada: %', p_account_id;
    END IF;
    
    IF v_account_status != 'paid' THEN
        RAISE EXCEPTION 'Conta não está paga, status atual: %', v_account_status;
    END IF;
    
    -- 1. Deletar movimentações financeiras relacionadas
    DELETE FROM cash_movements
    WHERE reference_type = 'account_payment'
      AND reference_id = p_account_id;
    
    GET DIAGNOSTICS v_deleted_movements = ROW_COUNT;
    
    -- Log de quantas movimentações foram deletadas
    IF v_deleted_movements > 0 THEN
        RAISE NOTICE 'Deletadas % movimentações financeiras', v_deleted_movements;
    END IF;
    
    -- 2. Reverter a conta para status pending
    UPDATE accounts_payable
    SET 
        status = 'pending',
        payment_date = NULL,
        paid_amount = NULL,
        financial_account_id = NULL,
        updated_at = NOW()
    WHERE id = p_account_id;
    
    -- Buscar dados atualizados da conta para retornar
    SELECT row_to_json(ap.*) INTO v_result
    FROM accounts_payable ap
    WHERE ap.id = p_account_id;
    
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
COMMENT ON FUNCTION reverse_account_payment IS 'Estorna o pagamento de uma conta, revertendo status e deletando movimentações financeiras relacionadas de forma transacional';