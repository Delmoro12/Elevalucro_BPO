-- ======================================
-- Execute Routine Procedure
-- ======================================
-- Records routine execution and updates next due date

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

  -- Check if company routine exists
  SELECT cr.custom_frequency
  INTO v_routine_frequency
  FROM companies_routines cr
  WHERE cr.id = p_company_routine_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company routine not found: %', p_company_routine_id;
  END IF;

  -- For now, just set a simple next execution date (monthly default)
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

-- Add comment
COMMENT ON FUNCTION public.execute_routine(UUID, UUID, VARCHAR, TEXT, TEXT[], INTEGER) IS 
'Records routine execution and updates next due date.
Parameters:
- p_company_routine_id: UUID of the company routine
- p_executed_by: UUID of the user who executed the routine
- p_status: Execution status (completed, partially_completed, failed)
- p_notes: Optional notes about the execution
- p_attachments: Optional array of attachment URLs
- p_time_spent_minutes: Optional time spent in minutes
Returns: JSONB with execution details and next due date';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.execute_routine TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_routine TO postgres;