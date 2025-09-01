-- ======================================
-- Update Onboarding Progress Procedure
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

-- Add comment
COMMENT ON FUNCTION public.update_onboarding_progress(UUID) IS 
'Updates onboarding progress percentage and lifecycle stage for a company.
Parameters:
- p_company_id: UUID of the company
Returns: JSONB with progress details and updated values';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO service_role;
GRANT EXECUTE ON FUNCTION public.update_onboarding_progress TO postgres;