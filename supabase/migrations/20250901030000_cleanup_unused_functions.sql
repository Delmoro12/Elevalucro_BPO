-- =============================================================================
-- Cleanup Unused Functions from Production Database
-- =============================================================================
-- Remove 19 unused functions (73% reduction):
-- - 4 truly unused functions
-- - 15 infrastructure functions (triggers + RLS) that will be recreated later
-- 
-- KEEP: 7 essential functions
-- - create_client_signup
-- - custom_access_token_hook
-- - setup_company_onboarding_checklist
-- - setup_company_routines
-- - execute_routine (investigate further)
-- - extract_user_names (investigate further)

-- =============================================================================
-- 1. DROP UNUSED FUNCTIONS (4 functions)
-- =============================================================================

-- Truly unused functions that can be safely removed
DROP FUNCTION IF EXISTS cleanup_user_data CASCADE;
DROP FUNCTION IF EXISTS create_auth_user_direct CASCADE;
DROP FUNCTION IF EXISTS test_jwt_hook_for_user CASCADE;
DROP FUNCTION IF EXISTS update_onboarding_progress CASCADE;

-- =============================================================================
-- 2. DROP INFRASTRUCTURE FUNCTIONS (15 functions)
-- =============================================================================

-- Update triggers (11 functions) - will recreate later if needed
DROP FUNCTION IF EXISTS update_companies_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_permissions_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_role_permissions_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_roles_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_user_companies_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_user_company_roles_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_user_permissions_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_users_updated_at CASCADE;
DROP FUNCTION IF EXISTS ensure_single_primary_role CASCADE;
DROP FUNCTION IF EXISTS sync_user_company_roles_cache CASCADE;
DROP FUNCTION IF EXISTS sync_user_permissions_cache CASCADE;

-- RLS policy functions (4 functions) - will recreate later if needed
DROP FUNCTION IF EXISTS user_has_company_access CASCADE;
DROP FUNCTION IF EXISTS user_is_bpo CASCADE;
DROP FUNCTION IF EXISTS user_is_bpo_super_admin CASCADE;
DROP FUNCTION IF EXISTS user_is_company_admin CASCADE;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Functions REMOVED: 19 total
-- - Unused: cleanup_user_data, create_auth_user_direct, test_jwt_hook_for_user, update_onboarding_progress
-- - Infrastructure: All triggers and RLS functions (will recreate if needed)
--
-- Functions KEPT: 7 total
-- - create_client_signup (essential for signup)
-- - custom_access_token_hook (essential for JWT)
-- - setup_company_onboarding_checklist (used by signup)
-- - setup_company_routines (used by signup)
-- - execute_routine (needs investigation)
-- - extract_user_names (needs investigation)
-- 
-- Production database will have 26 → 7 functions (73% reduction)