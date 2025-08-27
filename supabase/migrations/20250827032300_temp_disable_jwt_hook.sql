-- Temporarily disable JWT hook to test user creation
-- This will be reverted after testing

-- Drop the JWT hook function temporarily
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

-- Create a dummy function that does nothing
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Return event unchanged (no processing)
  RETURN event;
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;