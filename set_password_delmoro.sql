-- Script para definir senha diretamente para o usuário delmoro123@gmail.com
-- Execute este script no Supabase local

-- Primeiro, vamos verificar se o usuário existe
SELECT id, email, created_at, confirmed_at 
FROM auth.users 
WHERE email = 'delmoro123@gmail.com';

-- Atualizar a senha do usuário
-- A senha será: teste123
UPDATE auth.users 
SET 
    encrypted_password = crypt('teste123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'delmoro123@gmail.com';

-- Verificar se foi atualizado
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'delmoro123@gmail.com';

-- Garantir que o usuário existe na tabela public.users também
SELECT u.*, p.*, c.name as company_name
FROM public.users u
LEFT JOIN public.profiles p ON u.profile_id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
WHERE u.email = 'delmoro123@gmail.com';