-- ======================================
-- Add Onboarding and Routines Procedures
-- ======================================
-- Migration to deploy procedures from /database/procedures/

-- 1. Setup Company Onboarding Checklist
CREATE OR REPLACE FUNCTION public.setup_company_onboarding_checklist(
  p_company_id UUID
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_items_created INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Setting up onboarding checklist for company: %', p_company_id;

  -- Create checklist items for the company based on active templates
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    is_checked,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    oc.id,
    false, -- all items start unchecked
    NOW(),
    NOW()
  FROM onboarding_checklist oc
  WHERE oc.is_active = true
  ORDER BY oc.week ASC, oc.display_order ASC;

  -- Get count of items created
  GET DIAGNOSTICS v_items_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'items_created', v_items_created,
    'message', format('%s onboarding checklist items created', v_items_created)
  );

  -- Log completion
  RAISE LOG 'Onboarding checklist setup completed - Company: %, Items created: %', 
    p_company_id, v_items_created;

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

-- 2. Setup Company Routines
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
  INSERT INTO companies_routines (
    company_id,
    routine_id,
    is_active,
    start_date,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    r.id,
    true,
    v_start_date,
    NOW(),
    NOW()
  FROM routines r
  WHERE r.is_active = true
  AND r.is_template = true
  ORDER BY r.priority DESC, r.name ASC;

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

-- 3. Update Onboarding Progress
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

-- 4. Execute Routine
CREATE OR REPLACE FUNCTION public.execute_routine(
  p_company_routine_id UUID,
  p_executed_by UUID,
  p_status VARCHAR(20) DEFAULT 'completed',
  p_notes TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL,
  p_time_spent_minutes INTEGER DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_routine_frequency VARCHAR(20);
  v_next_due_date DATE;
  v_execution_id UUID;
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Executing routine - Company Routine: %, User: %', p_company_routine_id, p_executed_by;

  -- Get routine frequency to calculate next execution
  SELECT COALESCE(cr.custom_frequency, r.frequency)
  INTO v_routine_frequency
  FROM companies_routines cr
  JOIN routines r ON cr.routine_id = r.id
  WHERE cr.id = p_company_routine_id;

  IF v_routine_frequency IS NULL THEN
    RAISE EXCEPTION 'Company routine not found: %', p_company_routine_id;
  END IF;

  -- For now, just set a simple next execution date
  v_next_due_date := CURRENT_DATE + INTERVAL '1 month';

  -- Insert execution record
  INSERT INTO routine_executions (
    company_routine_id,
    executed_at,
    executed_by,
    status,
    notes,
    attachments,
    time_spent_minutes,
    next_execution_date,
    created_at,
    updated_at
  ) VALUES (
    p_company_routine_id,
    NOW(),
    p_executed_by,
    p_status,
    p_notes,
    p_attachments,
    p_time_spent_minutes,
    v_next_due_date,
    NOW(),
    NOW()
  ) RETURNING id INTO v_execution_id;

  -- Update company routine with last execution info
  UPDATE companies_routines 
  SET 
    last_completed_at = NOW(),
    last_completed_by = p_executed_by,
    completion_count = completion_count + 1,
    updated_at = NOW()
  WHERE id = p_company_routine_id;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'execution_id', v_execution_id,
    'company_routine_id', p_company_routine_id,
    'executed_by', p_executed_by,
    'status', p_status,
    'next_due_date', v_next_due_date,
    'frequency', v_routine_frequency,
    'message', format('Routine executed successfully. Next due: %s', v_next_due_date)
  );

  -- Log completion
  RAISE LOG 'Routine execution completed - Execution ID: %, Next due: %', 
    v_execution_id, v_next_due_date;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error executing routine %: %', p_company_routine_id, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_routine_id', p_company_routine_id,
    'error', SQLERRM,
    'message', 'Failed to execute routine'
  );
END;
$$;

-- Add comments and permissions
COMMENT ON FUNCTION public.setup_company_onboarding_checklist(UUID) IS 'Creates onboarding checklist items for a new company based on active templates';
COMMENT ON FUNCTION public.setup_company_routines(UUID, VARCHAR) IS 'Creates routine assignments for a new company based on subscription plan';
COMMENT ON FUNCTION public.update_onboarding_progress(UUID) IS 'Updates onboarding progress percentage and lifecycle stage for a company';
COMMENT ON FUNCTION public.execute_routine(UUID, UUID, VARCHAR, TEXT, TEXT[], INTEGER) IS 'Records routine execution and updates completion tracking';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO postgres;
GRANT EXECUTE ON FUNCTION public.setup_company_routines TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_routines TO postgres;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO service_role;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO postgres;
GRANT EXECUTE ON FUNCTION public.execute_routine TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_routine TO postgres;