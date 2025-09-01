-- ======================================
-- Setup Company Onboarding Checklist Procedure
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

-- Add comment
COMMENT ON FUNCTION public.setup_company_onboarding_checklist(UUID, VARCHAR) IS 
'Creates onboarding checklist items for a new company based on active templates and subscription plan.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado) - defaults to controle
Returns: JSONB with success status and created items count';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO postgres;