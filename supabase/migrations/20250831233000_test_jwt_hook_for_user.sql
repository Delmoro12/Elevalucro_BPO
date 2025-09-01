-- Test JWT Hook for specific user
CREATE OR REPLACE FUNCTION test_jwt_hook_for_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id uuid;
  v_profile_id uuid;
  v_role_name text;
  v_subscription_plan text;
  v_subscription_status text;
  v_result jsonb;
BEGIN
  -- Get user data with role, company and subscription information
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
  WHERE u.id = p_user_id
  LIMIT 1;

  -- Build result similar to JWT hook
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'company_id', COALESCE(v_company_id::text, 'null'),
    'profile_id', COALESCE(v_profile_id::text, 'null'),
    'role_name', COALESCE(v_role_name, 'null'),
    'subscription_plan', COALESCE(v_subscription_plan, 'null'),
    'subscription_status', COALESCE(v_subscription_status, 'null')
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION test_jwt_hook_for_user TO service_role;
GRANT EXECUTE ON FUNCTION test_jwt_hook_for_user TO postgres;