-- Fix JWT hook to handle missing users gracefully
-- Version: 1.2.1 - Tolerance for missing users

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
  v_subscription_plan text;
  v_subscription_status text;
  v_existing_metadata jsonb;
  v_claims jsonb;
BEGIN
  -- Extract user_id from event
  v_user_id := (event->>'user_id')::uuid;
  
  IF v_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Get user data with role, company and subscription information
  -- Use COALESCE to handle cases where user doesn't exist in public.users yet
  BEGIN
    SELECT 
      p.company_id,
      u.profile_id,
      r.name as role_name,
      s.plan_type as subscription_plan,
      s.status as subscription_status
    INTO v_company_id, v_profile_id, v_role_name, v_subscription_plan, v_subscription_status
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_active = true
    LEFT JOIN profiles p ON (u.profile_id = p.id OR up.profile_id = p.id)
    LEFT JOIN roles r ON p.role_id = r.id
    LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
    WHERE u.id = v_user_id
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      -- If user doesn't exist yet, set all values to null
      v_company_id := NULL;
      v_profile_id := NULL;
      v_role_name := NULL;
      v_subscription_plan := NULL;
      v_subscription_status := NULL;
  END;

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

  -- Add subscription plan if exists
  IF v_subscription_plan IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'subscription_plan', v_subscription_plan,
      'subscription_status', COALESCE(v_subscription_status, 'inactive')
    );
  END IF;

  -- Add hook execution metadata
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.2.1'
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

-- Grant necessary permissions to supabase_auth_admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.user_profiles TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.companies TO supabase_auth_admin;
GRANT SELECT ON public.subscriptions TO supabase_auth_admin;