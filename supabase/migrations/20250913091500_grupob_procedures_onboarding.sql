-- =============================================================================
-- Migration: GRUPO B - Procedures de Onboarding
-- Generated at: 2025-09-13 09:15:00
-- =============================================================================
-- Procedures relacionadas ao processo de onboarding de empresas:
-- 1. Setup Company Onboarding Checklist
-- 2. Update Onboarding Progress

BEGIN;

-- ======================================
-- 1. SETUP COMPANY ONBOARDING CHECKLIST
-- ======================================
-- Creates onboarding checklist for a new company based on active templates

CREATE OR REPLACE FUNCTION public.setup_company_onboarding_checklist(
  p_company_id UUID,
  p_subscription_plan VARCHAR(50) DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_items_created INTEGER := 0;
  v_result JSONB;
  v_plan VARCHAR(50) := COALESCE(p_subscription_plan, 'controle'); -- Default to controle if null
BEGIN
  -- Log start
  RAISE LOG 'Setting up onboarding checklist for company: % with plan: %', p_company_id, v_plan;

  -- Create checklist items for the company based on active templates
  -- Insert denormalized data for performance
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    title,
    description,
    week,
    display_order,
    enabled_plans,
    responsible_department,
    is_checked,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    oc.id,
    oc.title,
    oc.description,
    oc.week,
    oc.display_order,
    oc.enabled_plans,
    oc.responsible_department,
    false, -- all items start unchecked
    NOW(),
    NOW()
  FROM onboarding_checklist oc
  WHERE oc.is_active = true
  AND v_plan = ANY(oc.enabled_plans) -- Filter by subscription plan
  ORDER BY oc.week ASC, oc.display_order ASC;

  -- Get count of items created
  GET DIAGNOSTICS v_items_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_plan', v_plan,
    'items_created', v_items_created,
    'message', format('%s onboarding checklist items created for %s plan', v_items_created, v_plan)
  );

  -- Log completion
  RAISE LOG 'Onboarding checklist setup completed - Company: %, Plan: %, Items created: %', 
    p_company_id, v_plan, v_items_created;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error setting up onboarding checklist for company %: %', p_company_id, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'error', SQLERRM,
    'message', 'Failed to create onboarding checklist'
  );
END;
$$;

-- ======================================
-- 2. UPDATE ONBOARDING PROGRESS
-- ======================================
-- Updates onboarding progress percentage and lifecycle stage for a company

CREATE OR REPLACE FUNCTION public.update_onboarding_progress(
  p_company_id UUID
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_items INTEGER := 0;
  v_completed_items INTEGER := 0;
  v_progress_percentage INTEGER := 0;
  v_old_progress INTEGER;
  v_old_lifecycle_stage VARCHAR(20);
  v_new_lifecycle_stage VARCHAR(20);
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Updating onboarding progress for company: %', p_company_id;

  -- Get current values
  SELECT onboarding_progress, lifecycle_stage 
  INTO v_old_progress, v_old_lifecycle_stage
  FROM companies 
  WHERE id = p_company_id;

  -- Calculate progress
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_checked = true) as completed
  INTO v_total_items, v_completed_items
  FROM companies_onboarding_checklist coc
  JOIN onboarding_checklist oc ON coc.checklist_item_id = oc.id
  WHERE coc.company_id = p_company_id
  AND oc.is_active = true;

  -- Calculate percentage (avoid division by zero)
  IF v_total_items > 0 THEN
    v_progress_percentage := ROUND((v_completed_items * 100.0) / v_total_items);
  ELSE
    v_progress_percentage := 0;
  END IF;

  -- Determine lifecycle stage based on progress
  IF v_progress_percentage = 100 THEN
    v_new_lifecycle_stage := 'production';
  ELSE
    v_new_lifecycle_stage := 'onboarding';
  END IF;

  -- Update company progress and lifecycle stage
  UPDATE companies 
  SET 
    onboarding_progress = v_progress_percentage,
    lifecycle_stage = v_new_lifecycle_stage,
    updated_at = NOW()
  WHERE id = p_company_id;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'total_items', v_total_items,
    'completed_items', v_completed_items,
    'progress_percentage', v_progress_percentage,
    'old_progress', v_old_progress,
    'lifecycle_stage', v_new_lifecycle_stage,
    'lifecycle_changed', (v_old_lifecycle_stage != v_new_lifecycle_stage),
    'message', format('Progress updated to %s%% (%s/%s items)', 
                     v_progress_percentage, v_completed_items, v_total_items)
  );

  -- Log completion
  RAISE LOG 'Onboarding progress updated - Company: %, Progress: %s%% (%s/%s), Lifecycle: % -> %', 
    p_company_id, v_progress_percentage, v_completed_items, v_total_items, 
    v_old_lifecycle_stage, v_new_lifecycle_stage;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error updating onboarding progress for company %: %', p_company_id, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'error', SQLERRM,
    'message', 'Failed to update onboarding progress'
  );
END;
$$;

-- ======================================
-- COMMENTS E PERMISSIONS
-- ======================================

-- Add comments
COMMENT ON FUNCTION public.setup_company_onboarding_checklist(UUID, VARCHAR) IS 
'Creates onboarding checklist items for a new company based on active templates and subscription plan.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado) - defaults to controle
Returns: JSONB with success status and created items count';

COMMENT ON FUNCTION public.update_onboarding_progress(UUID) IS 
'Updates onboarding progress percentage and lifecycle stage for a company.
Parameters:
- p_company_id: UUID of the company
Returns: JSONB with progress details and updated values';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO postgres;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO service_role;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO postgres;

COMMIT;