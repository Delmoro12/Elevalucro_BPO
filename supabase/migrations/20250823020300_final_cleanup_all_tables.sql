-- Complete cleanup of all Lucas Del Moro data across all tables
DO $$ 
DECLARE
    auth_user_record RECORD;
    public_user_record RECORD;
    company_record RECORD;
BEGIN
    -- Check and clean auth.users
    SELECT id, email INTO auth_user_record FROM auth.users WHERE email = 'delmoro123@gmail.com' LIMIT 1;
    IF auth_user_record.id IS NOT NULL THEN
        DELETE FROM auth.identities WHERE user_id = auth_user_record.id;
        DELETE FROM auth.sessions WHERE user_id = auth_user_record.id;
        DELETE FROM auth.refresh_tokens WHERE user_id = auth_user_record.id;
        DELETE FROM auth.users WHERE id = auth_user_record.id;
        RAISE NOTICE 'Deleted from auth.users: %', auth_user_record.email;
    END IF;

    -- Check and clean public.users
    SELECT id, email INTO public_user_record FROM users WHERE email = 'delmoro123@gmail.com' LIMIT 1;
    IF public_user_record.id IS NOT NULL THEN
        DELETE FROM user_profiles WHERE user_id = public_user_record.id;
        DELETE FROM users WHERE id = public_user_record.id;
        RAISE NOTICE 'Deleted from public.users: %', public_user_record.email;
    END IF;

    -- Check and clean companies
    FOR company_record IN (
        SELECT id, name, cnpj FROM companies 
        WHERE name ILIKE '%4U Supply%' OR cnpj = '47.436.379/0001-40'
    ) LOOP
        DELETE FROM subscriptions WHERE company_id = company_record.id;
        DELETE FROM permissions WHERE profile_id IN (SELECT id FROM profiles WHERE company_id = company_record.id);
        DELETE FROM user_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE company_id = company_record.id);
        DELETE FROM profiles WHERE company_id = company_record.id;
        DELETE FROM companies WHERE id = company_record.id;
        RAISE NOTICE 'Deleted company: % (CNPJ: %)', company_record.name, company_record.cnpj;
    END LOOP;

    -- Reset prospect status
    UPDATE prospects SET status = 'pending' WHERE email_contato = 'delmoro123@gmail.com';
    RAISE NOTICE 'Reset prospect status to pending';
    
    RAISE NOTICE 'Complete cleanup finished for Lucas Del Moro';
END $$;