-- ======================================
-- Setup Company Routines Procedure
-- ======================================
-- Creates company routines based on subscription plan and active templates

CREATE OR REPLACE FUNCTION public.setup_company_routines(
  p_company_id UUID,
  p_subscription_plan VARCHAR(50)
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_routines_created INTEGER := 0;
  v_result JSONB;
  v_start_date DATE := CURRENT_DATE;
BEGIN
  -- Log start
  RAISE LOG 'Setting up routines for company: % with plan: %', p_company_id, p_subscription_plan;

  -- Create routine assignments for the company based on subscription plan
  -- Duplica as rotinas templates para a empresa específica
  INSERT INTO companies_routines (
    company_id,
    routine_id,
    custom_name,
    custom_description, 
    custom_instructions,
    is_active,
    start_date,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    r.id,
    r.name,
    r.description,
    r.instructions,
    true,
    v_start_date,
    NOW(),
    NOW()
  FROM routines r
  WHERE r.is_active = true
  AND r.is_template = true
  ORDER BY r.name ASC;

  -- Get count of routines created
  GET DIAGNOSTICS v_routines_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_plan', p_subscription_plan,
    'routines_created', v_routines_created,
    'start_date', v_start_date,
    'message', format('%s routines created for %s plan', v_routines_created, p_subscription_plan)
  );

  -- Log completion
  RAISE LOG 'Company routines setup completed - Company: %, Plan: %, Routines created: %', 
    p_company_id, p_subscription_plan, v_routines_created;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error setting up routines for company % with plan %: %', p_company_id, p_subscription_plan, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'subscription_plan', p_subscription_plan,
    'error', SQLERRM,
    'message', 'Failed to create company routines'
  );
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.setup_company_routines(UUID, VARCHAR) IS 
'Creates routine assignments for a new company based on subscription plan and active templates.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado)
Returns: JSONB with success status and created routines count';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.setup_company_routines TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_routines TO postgres;