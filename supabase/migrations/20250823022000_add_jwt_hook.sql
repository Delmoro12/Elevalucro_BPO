-- =============================================================================
-- Custom Access Token Hook - JWT Enhancement
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_profile_id uuid;
  v_role_name text;
  v_role_side text;
  v_existing_metadata jsonb;
BEGIN
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Get user data with role and company information
  SELECT 
    up.company_id,
    u.profile_id,
    r.name as role_name,
    r.side as role_side
  INTO v_company_id, v_profile_id, v_role_name, v_role_side
  FROM users u
  LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_active = true
  LEFT JOIN profiles p ON u.profile_id = p.id
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE u.id = v_user_id;

  -- Get existing metadata from JWT
  v_existing_metadata := COALESCE(event->'claims'->'user_metadata', '{}'::jsonb);

  -- Add company_id if exists
  IF v_company_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('company_id', v_company_id);
  END IF;

  -- Add profile_id if exists  
  IF v_profile_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id);
  END IF;

  -- Add role information if exists
  IF v_role_name IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'role', v_role_name,
      'role_side', v_role_side
    );
  END IF;

  -- Add hook execution metadata
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.0.0',
    'jwt_hook_timestamp', extract(epoch from now())::bigint
  );

  -- Update event with enhanced metadata
  event := jsonb_set(event, '{claims,user_metadata}', v_existing_metadata);

  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail authentication on error
    RETURN event;
END;
$$;

-- Grant necessary permissions to supabase_auth_admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Grant SELECT permissions on required tables
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.user_profiles TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.companies TO supabase_auth_admin;