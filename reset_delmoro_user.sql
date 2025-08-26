-- Reset Lucas Del Moro user and set prospect to pending
DO $$ 
DECLARE
    auth_user_id UUID;
    public_user_id UUID;
    company_id_val UUID;
BEGIN
    RAISE NOTICE '🔄 Starting cleanup for Lucas Del Moro...';
    
    -- Find auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = 'delmoro123@gmail.com' LIMIT 1;
    IF auth_user_id IS NOT NULL THEN
        DELETE FROM auth.refresh_tokens WHERE user_id::uuid = auth_user_id;
        DELETE FROM auth.identities WHERE user_id::uuid = auth_user_id;
        DELETE FROM auth.sessions WHERE user_id::uuid = auth_user_id;
        DELETE FROM auth.users WHERE id = auth_user_id;
        RAISE NOTICE '✅ Deleted auth user: %', auth_user_id;
    ELSE
        RAISE NOTICE '⚠️ No auth user found for delmoro123@gmail.com';
    END IF;

    -- Find public user ID
    SELECT id INTO public_user_id FROM users WHERE email = 'delmoro123@gmail.com' LIMIT 1;
    IF public_user_id IS NOT NULL THEN
        DELETE FROM user_profiles WHERE user_id = public_user_id;
        DELETE FROM users WHERE id = public_user_id;
        RAISE NOTICE '✅ Deleted public user: %', public_user_id;
    ELSE
        RAISE NOTICE '⚠️ No public user found for delmoro123@gmail.com';
    END IF;

    -- Find and delete companies
    FOR company_id_val IN (SELECT id FROM companies WHERE name ILIKE '%4U Supply%' OR cnpj = '47.436.379/0001-40')
    LOOP
        DELETE FROM subscriptions WHERE company_id = company_id_val;
        DELETE FROM permissions WHERE profile_id IN (SELECT id FROM profiles WHERE company_id = company_id_val);
        DELETE FROM user_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE company_id = company_id_val);
        DELETE FROM profiles WHERE company_id = company_id_val;
        DELETE FROM companies WHERE id = company_id_val;
        RAISE NOTICE '✅ Deleted company: %', company_id_val;
    END LOOP;

    -- Reset prospect status to pending
    UPDATE prospects SET status = 'pending', updated_at = NOW() WHERE email_contato = 'delmoro123@gmail.com';
    RAISE NOTICE '✅ Reset prospect status to pending';
    
    RAISE NOTICE '🎉 Cleanup completed for Lucas Del Moro';
END $$;

-- Verify the cleanup
SELECT 
    'Results' as type,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'delmoro123@gmail.com') as auth_users,
    (SELECT COUNT(*) FROM users WHERE email = 'delmoro123@gmail.com') as public_users,
    (SELECT COUNT(*) FROM companies WHERE name ILIKE '%4U Supply%' OR cnpj = '47.436.379/0001-40') as companies,
    (SELECT status FROM prospects WHERE email_contato = 'delmoro123@gmail.com' LIMIT 1) as prospect_status;