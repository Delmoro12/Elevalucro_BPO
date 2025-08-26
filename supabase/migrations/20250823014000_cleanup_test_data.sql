-- Clean test data for Lucas Del Moro
DELETE FROM subscriptions WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '12.345.678/0001-99');
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email = 'delmoro123@gmail.com');
DELETE FROM permissions WHERE profile_id IN (SELECT id FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '12.345.678/0001-99'));
DELETE FROM users WHERE email = 'delmoro123@gmail.com';
DELETE FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE cnpj = '12.345.678/0001-99');
DELETE FROM companies WHERE cnpj = '12.345.678/0001-99';

-- Clean auth.users - this needs to be done carefully in production
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'delmoro123@gmail.com') THEN
        DELETE FROM auth.users WHERE email = 'delmoro123@gmail.com';
    END IF;
END $$;

-- Reset prospect status
UPDATE prospects SET status = 'pending' WHERE email_contato = 'delmoro123@gmail.com';