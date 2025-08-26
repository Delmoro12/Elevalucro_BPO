-- Function to cleanup user and all related data
CREATE OR REPLACE FUNCTION public.cleanup_user_data(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
    company_uuid uuid;
    result text;
BEGIN
    -- Get user ID from auth
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NOT NULL THEN
        -- Get company ID from users table
        SELECT p.company_id INTO company_uuid 
        FROM users u 
        JOIN profiles p ON u.profile_id = p.id 
        WHERE u.id = user_uuid;
        
        -- Delete from all related tables (in correct order)
        DELETE FROM permissions WHERE profile_id IN 
            (SELECT id FROM profiles WHERE company_id = company_uuid);
        DELETE FROM user_profiles WHERE user_id = user_uuid;
        DELETE FROM users WHERE id = user_uuid;
        DELETE FROM subscriptions WHERE company_id = company_uuid;
        DELETE FROM profiles WHERE company_id = company_uuid;
        DELETE FROM companies WHERE id = company_uuid;
        
        -- Delete from auth tables
        DELETE FROM auth.identities WHERE user_id = user_uuid;
        DELETE FROM auth.users WHERE id = user_uuid;
        
        result := 'Cleaned all data for user: ' || user_email;
    ELSE
        result := 'User not found: ' || user_email;
    END IF;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.cleanup_user_data TO service_role;