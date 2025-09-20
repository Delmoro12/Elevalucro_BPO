-- Teste da função create_client_signup
-- Simula os dados de um prospect

DO $$
DECLARE
    v_test_user_id UUID;
    v_prospect_data JSONB;
    v_result JSONB;
BEGIN
    -- Gerar um UUID de teste
    v_test_user_id := gen_random_uuid();
    
    -- Criar dados de prospect de teste
    v_prospect_data := jsonb_build_object(
        'nome_empresa', 'Empresa Teste Migration',
        'email_contato', 'teste.migration@example.com',
        'nome_contato', 'João Silva',
        'telefone_contato', '11999999999',
        'cnpj', '12.345.678/0001-90',
        'plano', 'controle'
    );
    
    -- Executar a função
    v_result := create_client_signup(v_test_user_id, v_prospect_data);
    
    -- Mostrar resultado
    RAISE NOTICE 'Resultado: %', v_result;
    
    -- Verificar se o usuário foi criado com company_id
    PERFORM 1 FROM users 
    WHERE id = v_test_user_id 
    AND company_id IS NOT NULL;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Usuário criado com company_id!';
    ELSE
        RAISE NOTICE '❌ Erro: Usuário sem company_id!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na execução: %', SQLERRM;
        RAISE;
END;
$$;