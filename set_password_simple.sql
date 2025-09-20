-- Script simplificado para definir senha
-- Senha: teste123

UPDATE auth.users 
SET 
    encrypted_password = crypt('teste123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'delmoro123@gmail.com';

-- Verificar resultado
SELECT 
    email,
    email_confirmed_at,
    updated_at,
    'Senha atualizada para: teste123' as info
FROM auth.users 
WHERE email = 'delmoro123@gmail.com';