CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  AS $$
  DECLARE
    v_user_id uuid;
    v_existing_metadata jsonb;
    v_claims jsonb;
    v_company_id text;
    v_profile_id text;
    v_role text;
    v_plan text;
    v_status text;
  BEGIN
    v_user_id := (event->>'user_id')::uuid;

    IF v_user_id IS NULL THEN
      RETURN event;
    END IF;

    -- Get existing claims
    v_claims := COALESCE(event->'claims', '{}'::jsonb);
    v_existing_metadata := COALESCE(v_claims->'user_metadata', '{}'::jsonb);

    -- Set search path to ensure we're looking in the right schema
    PERFORM set_config('search_path', 'public', true);

    -- Get user data - BPO users may not have profile/company
    -- Using LEFT JOINs to handle both BPO and client users
    BEGIN
      SELECT
        u.company_id::text,
        u.profile_id::text,
        r.name,
        COALESCE(s.plan_type, 'controle'),
        COALESCE(s.status, 'active')
      INTO v_company_id, v_profile_id, v_role, v_plan, v_status
      FROM public.users u
      LEFT JOIN public.roles r ON u.role_id = r.id
      LEFT JOIN public.subscriptions s ON u.company_id = s.company_id
        AND s.status = 'active'
      WHERE u.id = v_user_id
      LIMIT 1;

      -- Add the retrieved data only if not null
      IF v_company_id IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('company_id', v_company_id);
      END IF;
      
      IF v_profile_id IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('profile_id', v_profile_id);
      END IF;
      
      IF v_role IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object('role', v_role);
      END IF;
      
      IF v_plan IS NOT NULL THEN
        v_existing_metadata := v_existing_metadata || jsonb_build_object(
          'subscription_plan', v_plan,
          'subscription_status', v_status
        );
      END IF;

    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        -- User not found - this is normal for new users
        NULL;
      WHEN OTHERS THEN
        -- Any other error - continue without adding claims
        NULL;
    END;

    -- Add hook execution metadata
    v_existing_metadata := v_existing_metadata || jsonb_build_object(
      'jwt_hook_executed', true,
      'jwt_hook_version', '3.1.0-bpo-compatible',
      'processed_at', NOW()::text
    );

    -- Update claims with metadata
    v_claims := v_claims || jsonb_build_object('user_metadata',
  v_existing_metadata);

    -- Update event with new claims
    event := event || jsonb_build_object('claims', v_claims);

    RETURN event;

  EXCEPTION
    WHEN OTHERS THEN
      -- Never fail authentication - return original event
      RETURN event;
  END;
  $$;

  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
  GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO
  supabase_auth_admin;
  GRANT SELECT ON public.users TO supabase_auth_admin;
  GRANT SELECT ON public.profiles TO supabase_auth_admin;
  GRANT SELECT ON public.roles TO supabase_auth_admin;
  GRANT SELECT ON public.companies TO supabase_auth_admin;
  GRANT SELECT ON public.subscriptions TO supabase_auth_admin;
