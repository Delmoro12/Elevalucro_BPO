-- Simplified JWT Hook that works
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
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Simple direct query
  BEGIN
    SELECT 
      r.name,
      u.profile_id
    INTO v_role_name, v_profile_id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = v_user_id
    LIMIT 1;
    
  EXCEPTION
    WHEN OTHERS THEN
      v_role_name := NULL;
      v_profile_id := NULL;
  END;

  -- Get existing claims
  v_claims := COALESCE(event->'claims', '{}'::jsonb);
  v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

  -- Add role and other info
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'role', COALESCE(v_role_name, 'unknown'),
    'profile_id', COALESCE(v_profile_id::text, 'null'),
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.2.1'
  );

  -- Update claims
  v_claims := v_claims || jsonb_build_object('user_metadata', v_existing_metadata);
  event := event || jsonb_build_object('claims', v_claims);

  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN event;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;