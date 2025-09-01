-- Função para criar operador BPO
-- Apenas cria o usuário na tabela users com role bpo_side
-- Não cria empresa como é feito para clientes

CREATE OR REPLACE FUNCTION create_bpo_operator_signup(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bpo_role_id UUID;
    v_result JSON;
BEGIN
    -- 1. Buscar role_id para 'bpo_side'
    SELECT id INTO v_bpo_role_id 
    FROM roles 
    WHERE name = 'bpo_side'
    LIMIT 1;
    
    IF v_bpo_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "bpo_side" não encontrada na tabela roles.';
    END IF;
    
    -- 2. Criar registro na tabela users
    INSERT INTO users (
        id, 
        email, 
        full_name,
        first_name,
        last_name,
        phone,
        role_id,
        is_active,
        is_verified,
        verification_level,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_email,
        p_full_name,
        SPLIT_PART(p_full_name, ' ', 1), -- primeiro nome
        CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(p_full_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(p_full_name FROM POSITION(' ' IN p_full_name) + 1))
            ELSE ''
        END, -- último nome(s)
        p_phone,
        v_bpo_role_id,
        true, -- is_active
        true, -- is_verified (operadores BPO são verificados por padrão)
        'full', -- verification_level
        NOW(),
        NOW()
    );
    
    -- 3. Montar resposta de sucesso
    v_result := json_build_object(
        'success', true,
        'user_id', p_user_id,
        'email', p_email,
        'full_name', p_full_name,
        'role', 'bpo_side',
        'created_at', NOW()
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Email já está em uso: %', p_email;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar operador BPO: %', SQLERRM;
        
END;
$$;