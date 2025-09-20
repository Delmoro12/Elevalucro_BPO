-- =============================================================================
-- Function: increment_routine_completion_count
-- =============================================================================
-- Increments the completion count for a routine in companies_routines table

CREATE OR REPLACE FUNCTION increment_routine_completion_count(routine_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE companies_routines 
  SET 
    completion_count = COALESCE(completion_count, 0) + 1,
    updated_at = NOW()
  WHERE id = routine_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_routine_completion_count(UUID) TO authenticated;