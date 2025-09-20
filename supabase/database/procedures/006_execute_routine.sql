-- ======================================
-- Execute Routine Procedure
-- ======================================
-- Records routine execution and updates next due date

CREATE OR REPLACE FUNCTION public.execute_routine(
  p_company_routine_id UUID,
  p_executed_by UUID,
  p_status VARCHAR(20) DEFAULT 'completed',
  p_notes TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_routine_record RECORD;
  v_next_execution_date DATE;
  v_execution_id UUID;
  v_result JSONB;
BEGIN
  -- Log start
  RAISE LOG 'Executing routine - Company Routine: %, User: %', p_company_routine_id, p_executed_by;

  -- Get routine details including frequency and scheduling fields
  SELECT 
    cr.custom_frequency,
    cr.day_of_week,
    cr.day_of_month,
    cr.month_of_year,
    cr.start_date,
    COALESCE(cr.last_execution_date, cr.start_date, CURRENT_DATE) as last_date
  INTO v_routine_record
  FROM companies_routines cr
  WHERE cr.id = p_company_routine_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company routine not found: %', p_company_routine_id;
  END IF;

  -- Calculate next execution date based on frequency
  CASE v_routine_record.custom_frequency
    WHEN 'daily' THEN
      v_next_execution_date := CURRENT_DATE + INTERVAL '1 day';
      
    WHEN 'weekly' THEN
      -- If day_of_week is specified, find next occurrence of that day
      IF v_routine_record.day_of_week IS NOT NULL THEN
        -- Calculate days until target day of week
        v_next_execution_date := CURRENT_DATE + 
          ((v_routine_record.day_of_week - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7 + 7)::INT * INTERVAL '1 day';
      ELSE
        -- Default to 7 days from now
        v_next_execution_date := CURRENT_DATE + INTERVAL '7 days';
      END IF;
      
    WHEN 'monthly' THEN
      -- If day_of_month is specified, set to that day next month
      IF v_routine_record.day_of_month IS NOT NULL THEN
        -- Start with next month
        v_next_execution_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
        -- Add the specified day (minus 1 since we're at day 1)
        v_next_execution_date := v_next_execution_date + (v_routine_record.day_of_month - 1) * INTERVAL '1 day';
        
        -- Handle cases where day doesn't exist (e.g., Feb 31st becomes Feb 28/29)
        IF EXTRACT(MONTH FROM v_next_execution_date) != EXTRACT(MONTH FROM DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month') THEN
          -- Day overflowed to next month, use last day of intended month
          v_next_execution_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '1 month' - INTERVAL '1 day';
        END IF;
      ELSE
        -- Default to 1 month from now
        v_next_execution_date := CURRENT_DATE + INTERVAL '1 month';
      END IF;
      
    WHEN 'quarterly' THEN
      -- Add 3 months
      v_next_execution_date := CURRENT_DATE + INTERVAL '3 months';
      
    WHEN 'yearly' THEN
      -- If month and day are specified, set to that date next year
      IF v_routine_record.month_of_year IS NOT NULL THEN
        -- Start with next year
        v_next_execution_date := DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year';
        -- Add the months
        v_next_execution_date := v_next_execution_date + (v_routine_record.month_of_year - 1) * INTERVAL '1 month';
        -- Add the days if specified
        IF v_routine_record.day_of_month IS NOT NULL THEN
          v_next_execution_date := v_next_execution_date + (v_routine_record.day_of_month - 1) * INTERVAL '1 day';
        END IF;
      ELSE
        -- Default to 1 year from now
        v_next_execution_date := CURRENT_DATE + INTERVAL '1 year';
      END IF;
      
    ELSE
      -- Default to monthly if frequency is not recognized
      v_next_execution_date := CURRENT_DATE + INTERVAL '1 month';
  END CASE;

  -- Insert execution record (without next_execution_date and time_spent_minutes)
  INSERT INTO routine_executions (
    company_routine_id,
    executed_at,
    executed_by,
    status,
    notes,
    attachments,
    created_at,
    updated_at
  ) VALUES (
    p_company_routine_id,
    NOW(),
    p_executed_by,
    p_status,
    p_notes,
    p_attachments,
    NOW(),
    NOW()
  ) RETURNING id INTO v_execution_id;

  -- Update company routine with execution info and next date
  UPDATE companies_routines 
  SET 
    last_completed_at = NOW(),
    last_completed_by = p_executed_by,
    last_execution_date = CURRENT_DATE,
    next_execution_date = v_next_execution_date,
    completion_count = COALESCE(completion_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_company_routine_id;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'execution_id', v_execution_id,
    'company_routine_id', p_company_routine_id,
    'executed_by', p_executed_by,
    'status', p_status,
    'next_execution_date', v_next_execution_date,
    'frequency', v_routine_record.custom_frequency,
    'message', format('Routine executed successfully. Next execution: %s', v_next_execution_date)
  );

  -- Log completion
  RAISE LOG 'Routine execution completed - Execution ID: %, Next execution: %', 
    v_execution_id, v_next_execution_date;

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
COMMENT ON FUNCTION public.execute_routine(UUID, UUID, VARCHAR, TEXT, TEXT[]) IS 
'Records routine execution and calculates next execution date based on frequency and schedule settings.
Parameters:
- p_company_routine_id: UUID of the company routine
- p_executed_by: UUID of the user who executed the routine
- p_status: Execution status (completed, partially_completed, failed)
- p_notes: Optional notes about the execution
- p_attachments: Optional array of attachment URLs
Returns: JSONB with execution details and next execution date';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.execute_routine TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_routine TO postgres;