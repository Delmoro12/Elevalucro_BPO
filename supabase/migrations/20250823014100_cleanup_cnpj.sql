-- Clean data for CNPJ 47.436.379/0001-40
DELETE FROM subscriptions WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '47.436.379/0001-40');
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email = 'delmoro123@gmail.com');
DELETE FROM permissions WHERE profile_id IN (SELECT id FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '47.436.379/0001-40'));
DELETE FROM users WHERE email = 'delmoro123@gmail.com';
DELETE FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '47.436.379/0001-40');
DELETE FROM companies WHERE cnpj = '47.436.379/0001-40';

-- Clean auth.users
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'delmoro123@gmail.com') THEN
        DELETE FROM auth.users WHERE email = 'delmoro123@gmail.com';
    END IF;
END $$;

-- Reset all prospects with this email
UPDATE prospects SET status = 'pending' WHERE email_contato = 'delmoro123@gmail.com';