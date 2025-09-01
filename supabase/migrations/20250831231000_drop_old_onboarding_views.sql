-- ======================================
-- Migration: Drop Old Onboarding Views
-- ======================================
-- These views have been replaced by onboarding_companies_unified

-- Drop old views that are no longer needed
DROP VIEW IF EXISTS companies_onboarding_kanban CASCADE;
DROP VIEW IF EXISTS company_onboarding_details CASCADE;

-- Add comment to confirm removal
COMMENT ON VIEW onboarding_companies_unified IS 
'Unified view for onboarding - replaces both companies_onboarding_kanban and company_onboarding_details.
Uses denormalized companies_onboarding_checklist for better performance.
Serves both kanban listing and modal details.';