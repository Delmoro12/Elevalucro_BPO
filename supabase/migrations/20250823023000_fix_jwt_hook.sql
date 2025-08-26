-- Fix JWT Hook to properly return enriched claims
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
  v_existing_metadata jsonb;
  v_claims jsonb;
BEGIN
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Get user data with role and company information
  SELECT 
    p.company_id,
    u.profile_id,
    r.name as role_name
  INTO v_company_id, v_profile_id, v_role_name
  FROM users u
  LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_active = true
  LEFT JOIN profiles p ON (u.profile_id = p.id OR up.profile_id = p.id)
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE u.id = v_user_id
  LIMIT 1;

  -- Get existing claims or create new object
  v_claims := COALESCE(event->'claims', '{}'::jsonb);
  
  -- Get existing metadata or create new
  v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

  -- Add company_id if exists
  IF v_company_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('company_id', v_company_id::text);
  END IF;

  -- Add profile_id if exists  
  IF v_profile_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id::text);
  END IF;

  -- Add role information if exists
  IF v_role_name IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('role', v_role_name);
  END IF;

  -- Add hook execution metadata
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.0.1'
  );

  -- Update claims with metadata
  v_claims := v_claims || jsonb_build_object('user_metadata', v_existing_metadata);
  
  -- Update event with new claims
  event := event || jsonb_build_object('claims', v_claims);

  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail authentication on error
    RAISE WARNING 'JWT Hook Error: %', SQLERRM;
    RETURN event;
END;
$$;