-- Simple cleanup for delmoro123@gmail.com
-- Remove any records that might be blocking user creation

-- Clean auth.identities first
DELETE FROM auth.identities 
WHERE identity_data->>'email' = 'delmoro123@gmail.com';

-- Clean auth.users records  
DELETE FROM auth.users 
WHERE email = 'delmoro123@gmail.com';

-- Clean public schema
DELETE FROM public.users 
WHERE email = 'delmoro123@gmail.com';

DELETE FROM public.prospects 
WHERE email_contato = 'delmoro123@gmail.com';