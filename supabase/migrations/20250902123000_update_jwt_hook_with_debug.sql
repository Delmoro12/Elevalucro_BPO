-- Update JWT Hook with debug logging
-- This will replace the current silent version with one that has proper logging

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
    RAISE WARNING 'JWT Hook: user_id is NULL in event';
    RETURN event;
  END IF;

  RAISE WARNING 'JWT Hook: Processing user_id: %', v_user_id;

  -- Get user data with role, company and subscription information
  BEGIN
    SELECT 
      p.company_id,
      u.profile_id,
      r.name as role_name,
      s.plan_type as subscription_plan,
      s.status as subscription_status
    INTO v_company_id, v_profile_id, v_role_name, v_subscription_plan, v_subscription_status
    FROM users u
    LEFT JOIN profiles p ON u.profile_id = p.id
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN subscriptions s ON p.company_id = s.company_id AND s.status = 'active'
    WHERE u.id = v_user_id
    LIMIT 1;
    
    -- Log what we found
    RAISE WARNING 'JWT Hook Debug - User: %, Profile: %, Company: %, Role: %, Plan: %', 
      v_user_id, v_profile_id, v_company_id, v_role_name, v_subscription_plan;
      
    -- Check if query returned data
    IF v_company_id IS NULL THEN
      RAISE WARNING 'JWT Hook: Query returned NULL company_id for user %', v_user_id;
    END IF;
    
    IF v_role_name IS NULL THEN
      RAISE WARNING 'JWT Hook: Query returned NULL role_name for user %', v_user_id;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'JWT Hook: Error querying user data: %', SQLERRM;
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
    RAISE WARNING 'JWT Hook: Added company_id: %', v_company_id;
  ELSE
    RAISE WARNING 'JWT Hook: company_id is NULL - user may not have profile/company assigned';
  END IF;

  -- Add profile_id if exists  
  IF v_profile_id IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id::text);
    RAISE WARNING 'JWT Hook: Added profile_id: %', v_profile_id;
  ELSE
    RAISE WARNING 'JWT Hook: profile_id is NULL';
  END IF;

  -- Add role information if exists
  IF v_role_name IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object('role', v_role_name);
    RAISE WARNING 'JWT Hook: Added role: %', v_role_name;
  ELSE
    RAISE WARNING 'JWT Hook: role_name is NULL - user may not have role assigned';
  END IF;

  -- Add subscription plan if exists
  IF v_subscription_plan IS NOT NULL THEN
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'subscription_plan', v_subscription_plan,
      'subscription_status', COALESCE(v_subscription_status, 'inactive')
    );
    RAISE WARNING 'JWT Hook: Added subscription_plan: %', v_subscription_plan;
  END IF;

  -- Add hook execution metadata
  v_existing_metadata := v_existing_metadata || jsonb_build_object(
    'jwt_hook_executed', true,
    'jwt_hook_version', '1.3.0-debug',
    'processed_at', NOW()::text
  );

  -- Update claims with metadata
  v_claims := v_claims || jsonb_build_object('user_metadata', v_existing_metadata);
  
  -- Update event with new claims
  event := event || jsonb_build_object('claims', v_claims);

  RAISE WARNING 'JWT Hook: Final metadata: %', v_existing_metadata::text;
  
  RETURN event;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail authentication on error
    RAISE WARNING 'JWT Hook Fatal Error: %', SQLERRM;
    RETURN event;
END;
$$;