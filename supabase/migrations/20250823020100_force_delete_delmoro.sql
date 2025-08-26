-- Force delete Lucas Del Moro from auth.users
-- This is a direct delete from auth schema (be careful in production)

-- First, try to delete from auth.users using admin functions
DO $$ 
DECLARE
    user_record RECORD;
BEGIN
    -- Get user ID from auth.users
    SELECT id, email INTO user_record 
    FROM auth.users 
    WHERE email = 'delmoro123@gmail.com'
    LIMIT 1;
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE 'Found user in auth.users: % (%)', user_record.email, user_record.id;
        
        -- Delete from auth.users directly
        DELETE FROM auth.users WHERE id = user_record.id;
        RAISE NOTICE 'Deleted user from auth.users: %', user_record.email;
        
        -- Also clean any auth-related tables
        DELETE FROM auth.identities WHERE user_id = user_record.id;
        DELETE FROM auth.sessions WHERE user_id = user_record.id;
        
        RAISE NOTICE 'Cleaned auth identities and sessions for user %', user_record.id;
    ELSE
        RAISE NOTICE 'No user found in auth.users with email delmoro123@gmail.com';
    END IF;
END $$;