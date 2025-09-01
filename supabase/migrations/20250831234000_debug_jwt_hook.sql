-- Debug JWT Hook - Simplified version
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_role_name text;
  v_profile_id uuid;
  v_existing_metadata jsonb;
  v_claims jsonb;
BEGIN
  -- Log the hook execution
  RAISE LOG 'JWT Hook called with event: %', event;
  
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RAISE LOG 'No user_id found in event';
    RETURN event;
  END IF;

  RAISE LOG 'Processing JWT for user_id: %', v_user_id;

  -- Simplified query - just get role directly
  BEGIN
    SELECT 
      r.name as role_name,
      u.profile_id
    INTO v_role_name, v_profile_id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = v_user_id
    LIMIT 1;
    
    RAISE LOG 'Found role: % for user: %', v_role_name, v_user_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error querying user data: %', SQLERRM;
      v_role_name := 'error';
      v_profile_id := NULL;
  END;

  -- Get existing claims or create new object
  v_claims := COALESCE(event->'claims', '{}'::jsonb);
  
  -- Get existing metadata or create new
  v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

  -- Add role information
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'role', COALESCE(v_role_name, 'unknown'),
    'profile_id', COALESCE(v_profile_id::text, 'null'),
    'hook_version', 'debug-1.0',
    'hook_executed', true,
    'debug_timestamp', NOW()::text
  );

  -- Update claims with metadata
  v_claims := v_claims || jsonb_build_object('user_metadata', v_existing_metadata);
  
  -- Update event with new claims
  event := event || jsonb_build_object('claims', v_claims);

  RAISE LOG 'JWT Hook completed for user: %, role: %', v_user_id, v_role_name;

  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'JWT Hook Error: %', SQLERRM;
    RETURN event;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;