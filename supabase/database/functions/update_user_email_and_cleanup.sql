-- Function to update user email and optionally delete related records
-- Use with EXTREME CAUTION in production!

CREATE OR REPLACE FUNCTION update_user_email_and_cleanup(
  p_old_email TEXT,
  p_new_email TEXT,
  p_delete_related BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  status TEXT,
  message TEXT,
  affected_users INTEGER,
  affected_profiles INTEGER,
  affected_company_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_affected_users INTEGER := 0;
  v_affected_profiles INTEGER := 0;
  v_affected_company_users INTEGER := 0;
BEGIN
  -- Validate inputs
  IF p_old_email IS NULL OR p_new_email IS NULL THEN
    RETURN QUERY
    SELECT 
      'error'::TEXT,
      'Both old and new email must be provided'::TEXT,
      0,
      0,
      0;
    RETURN;
  END IF;

  -- Get user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_old_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN QUERY
    SELECT 
      'error'::TEXT,
      format('User with email %s not found', p_old_email)::TEXT,
      0,
      0,
      0;
    RETURN;
  END IF;

  -- Start transaction
  BEGIN
    -- Update email in auth.users
    UPDATE auth.users
    SET 
      email = p_new_email,
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email}',
        to_jsonb(p_new_email)
      )
    WHERE id = v_user_id;
    
    GET DIAGNOSTICS v_affected_users = ROW_COUNT;

    -- Update email in users table
    UPDATE public.users
    SET email = p_new_email
    WHERE id = v_user_id;

    -- Update email in profiles table if exists
    UPDATE public.profiles
    SET email = p_new_email
    WHERE user_id = v_user_id;
    
    GET DIAGNOSTICS v_affected_profiles = ROW_COUNT;

    -- If delete_related is true, delete related records
    IF p_delete_related THEN
      -- Delete from company_users
      DELETE FROM public.company_users
      WHERE user_id = v_user_id;
      
      GET DIAGNOSTICS v_affected_company_users = ROW_COUNT;
      
      -- Delete from profiles
      DELETE FROM public.profiles
      WHERE user_id = v_user_id;
      
      -- Delete from users table
      DELETE FROM public.users
      WHERE id = v_user_id;
      
      -- Note: We don't delete from auth.users as that would remove authentication
      -- If you want to fully delete the user, use a separate function
    END IF;

    -- Return success
    RETURN QUERY
    SELECT 
      'success'::TEXT,
      format('Email updated from %s to %s', p_old_email, p_new_email)::TEXT,
      v_affected_users,
      v_affected_profiles,
      v_affected_company_users;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on error
      RAISE;
      RETURN QUERY
      SELECT 
        'error'::TEXT,
        format('Error updating user: %s', SQLERRM)::TEXT,
        0,
        0,
        0;
  END;
END;
$$;

-- Grant execute permission to authenticated users (adjust as needed)
GRANT EXECUTE ON FUNCTION update_user_email_and_cleanup TO authenticated;

-- Example usage:
-- SELECT * FROM update_user_email_and_cleanup('old@email.com', 'new@email.com', false);
-- SELECT * FROM update_user_email_and_cleanup('old@email.com', 'new@email.com', true); -- This deletes related records

-- To completely delete a user and all related data:
CREATE OR REPLACE FUNCTION delete_user_completely(
  p_email TEXT
)
RETURNS TABLE(
  status TEXT,
  message TEXT,
  deleted_auth BOOLEAN,
  deleted_profiles INTEGER,
  deleted_company_users INTEGER,
  deleted_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_deleted_profiles INTEGER := 0;
  v_deleted_company_users INTEGER := 0;
  v_deleted_users INTEGER := 0;
  v_deleted_auth BOOLEAN := FALSE;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN QUERY
    SELECT 
      'error'::TEXT,
      format('User with email %s not found', p_email)::TEXT,
      FALSE,
      0,
      0,
      0;
    RETURN;
  END IF;

  -- Delete in correct order (respect foreign keys)
  BEGIN
    -- Delete from company_users
    DELETE FROM public.company_users
    WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_deleted_company_users = ROW_COUNT;

    -- Delete from profiles
    DELETE FROM public.profiles
    WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_deleted_profiles = ROW_COUNT;

    -- Delete from users table
    DELETE FROM public.users
    WHERE id = v_user_id;
    GET DIAGNOSTICS v_deleted_users = ROW_COUNT;

    -- Finally, delete from auth.users
    DELETE FROM auth.users
    WHERE id = v_user_id;
    v_deleted_auth := TRUE;

    RETURN QUERY
    SELECT 
      'success'::TEXT,
      format('User %s and all related data deleted successfully', p_email)::TEXT,
      v_deleted_auth,
      v_deleted_profiles,
      v_deleted_company_users,
      v_deleted_users;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
      RETURN QUERY
      SELECT 
        'error'::TEXT,
        format('Error deleting user: %s', SQLERRM)::TEXT,
        FALSE,
        0,
        0,
        0;
  END;
END;
$$;

-- Grant execute permission to authenticated users (adjust as needed)
GRANT EXECUTE ON FUNCTION delete_user_completely TO authenticated;

-- Example usage:
-- SELECT * FROM delete_user_completely('user@email.com');

-- Function to just update email without deleting anything
CREATE OR REPLACE FUNCTION update_user_email_simple(
  p_old_email TEXT,
  p_new_email TEXT
)
RETURNS TABLE(
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_old_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN QUERY
    SELECT 
      'error'::TEXT,
      format('User with email %s not found', p_old_email)::TEXT;
    RETURN;
  END IF;

  -- Update email in auth.users
  UPDATE auth.users
  SET 
    email = p_new_email,
    email_confirmed_at = CASE 
      WHEN email_confirmed_at IS NOT NULL THEN NOW() 
      ELSE NULL 
    END
  WHERE id = v_user_id;

  -- Update in public.users if exists
  UPDATE public.users
  SET email = p_new_email
  WHERE id = v_user_id;

  -- Update in public.profiles if exists
  UPDATE public.profiles
  SET email = p_new_email
  WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT 
    'success'::TEXT,
    format('Email updated from %s to %s', p_old_email, p_new_email)::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_email_simple TO authenticated;

-- Example usage:
-- SELECT * FROM update_user_email_simple('old@email.com', 'new@email.com');