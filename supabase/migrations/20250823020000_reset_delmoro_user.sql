-- Reset Lucas Del Moro user completely
DELETE FROM subscriptions WHERE company_id IN (SELECT id FROM companies WHERE name = '4U Supply Foods Ltda');
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email = 'delmoro123@gmail.com');
DELETE FROM permissions WHERE profile_id IN (SELECT id FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE name = '4U Supply Foods Ltda'));
DELETE FROM users WHERE email = 'delmoro123@gmail.com';
DELETE FROM profiles WHERE company_id IN (SELECT id FROM companies WHERE name = '4U Supply Foods Ltda');
DELETE FROM companies WHERE name = '4U Supply Foods Ltda';

-- Clean auth.users table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'delmoro123@gmail.com') THEN
        DELETE FROM auth.users WHERE email = 'delmoro123@gmail.com';
        RAISE NOTICE 'Deleted auth.users record for delmoro123@gmail.com';
    ELSE
        RAISE NOTICE 'No auth.users record found for delmoro123@gmail.com';
    END IF;
END $$;

-- Reset prospect status to pending
UPDATE prospects SET status = 'pending' WHERE email_contato = 'delmoro123@gmail.com';

-- Confirm cleanup
SELECT 'Cleanup completed for Lucas Del Moro' as status;