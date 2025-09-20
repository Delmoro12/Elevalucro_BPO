-- =============================================================================
-- Migration: Auth Permissions
-- Generated at: 2025-09-13 11:30:30
-- =============================================================================
-- This migration grants necessary SELECT permissions to supabase_auth_admin
-- to allow the JWT custom access token hook to access required tables.
--
-- CONTEXT:
-- The JWT hook (custom_access_token_hook) runs with supabase_auth_admin privileges
-- and needs to query users, roles, companies, profiles, and subscriptions tables
-- to populate JWT claims with company_id, role, subscription info, etc.
--
-- Without these permissions, the JWT hook fails during token refresh operations,
-- causing 500 Internal Server Errors and preventing client users from getting
-- proper JWT claims populated.

BEGIN;

-- Grant SELECT permissions to supabase_auth_admin for JWT hook functionality
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.companies TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.subscriptions TO supabase_auth_admin;

-- Note: These permissions are essential for:
-- 1. JWT hook to populate company_id, role, subscription_plan in user_metadata
-- 2. Token refresh operations to work without 500 errors
-- 3. Client-side users to receive proper authentication claims
-- 4. Differentiation between bpo_side and client_side users

COMMENT ON SCHEMA public IS 'Auth permissions granted to supabase_auth_admin for JWT hook functionality';

COMMIT;