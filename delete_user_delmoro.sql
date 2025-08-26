-- =====================================================
-- 🗑️ Script de Limpeza Completa - Usuário delmoro123@gmail.com
-- 📅 Data: 2025-01-24
-- 🎯 Objetivo: Deletar usuário e todos registros relacionados
-- ⚠️ ATENÇÃO: Este script é IRREVERSÍVEL!
-- =====================================================

-- Desabilitar temporariamente as verificações de FK para facilitar
SET session_replication_role = 'replica';

DO $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_profile_id UUID;
    v_email TEXT := 'delmoro123@gmail.com';
BEGIN
    -- 1. Buscar o user_id do auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuário % não encontrado no auth.users', v_email;
    ELSE
        RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;
        
        -- 2. Buscar company_id e profile_id relacionados
        SELECT profile_id INTO v_profile_id
        FROM public.users
        WHERE id = v_user_id;
        
        IF v_profile_id IS NOT NULL THEN
            SELECT company_id INTO v_company_id
            FROM public.profiles
            WHERE id = v_profile_id;
            
            RAISE NOTICE '📋 Profile ID: %', v_profile_id;
            RAISE NOTICE '🏢 Company ID: %', v_company_id;
        END IF;

        -- 3. Deletar registros em ordem reversa de dependência
        
        -- 3.1. Deletar permissions do profile
        IF v_profile_id IS NOT NULL THEN
            DELETE FROM public.permissions WHERE profile_id = v_profile_id;
            RAISE NOTICE '✅ Permissions deletadas';
        END IF;
        
        -- 3.2. Deletar user_profiles (relação muitos-para-muitos)
        DELETE FROM public.user_profiles WHERE user_id = v_user_id;
        RAISE NOTICE '✅ User_profiles deletados';
        
        -- 3.3. Deletar documentos da empresa (se houver)
        IF v_company_id IS NOT NULL THEN
            DELETE FROM public.documents WHERE company_id = v_company_id;
            RAISE NOTICE '✅ Documents deletados';
        END IF;
        
        -- 3.4. Deletar subscriptions da empresa
        IF v_company_id IS NOT NULL THEN
            DELETE FROM public.subscriptions WHERE company_id = v_company_id;
            RAISE NOTICE '✅ Subscriptions deletadas';
        END IF;
        
        -- 3.5. Deletar o usuário da tabela users
        DELETE FROM public.users WHERE id = v_user_id;
        RAISE NOTICE '✅ User deletado da tabela public.users';
        
        -- 3.6. Deletar profiles órfãos relacionados à empresa
        IF v_company_id IS NOT NULL THEN
            DELETE FROM public.profiles WHERE company_id = v_company_id;
            RAISE NOTICE '✅ Profiles da empresa deletados';
        END IF;
        
        -- 3.7. Deletar a empresa
        IF v_company_id IS NOT NULL THEN
            DELETE FROM public.companies WHERE id = v_company_id;
            RAISE NOTICE '✅ Company deletada';
        END IF;
        
        -- 3.8. Por último, deletar o usuário do auth.users
        DELETE FROM auth.users WHERE id = v_user_id;
        RAISE NOTICE '✅ Usuário deletado do auth.users';
        
        RAISE NOTICE '🎉 Limpeza completa realizada com sucesso!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro durante limpeza: %', SQLERRM;
        RAISE;
END $$;

-- Reabilitar verificações de FK
SET session_replication_role = 'origin';

-- Verificação final - deve retornar 0 registros
SELECT 
    'auth.users' as tabela,
    COUNT(*) as registros
FROM auth.users 
WHERE email = 'delmoro123@gmail.com'

UNION ALL

SELECT 
    'public.users' as tabela,
    COUNT(*) as registros
FROM public.users u
JOIN auth.users au ON u.id = au.id 
WHERE au.email = 'delmoro123@gmail.com';

-- =====================================================
-- 📊 RESUMO DO QUE FOI DELETADO:
-- - auth.users (usuário de autenticação)
-- - public.users (perfil público do usuário)
-- - public.user_profiles (vínculos usuário-perfil)
-- - public.profiles (perfis da empresa)
-- - public.permissions (permissões dos perfis)
-- - public.documents (documentos da empresa)
-- - public.subscriptions (assinaturas da empresa)
-- - public.companies (empresa)
-- =====================================================