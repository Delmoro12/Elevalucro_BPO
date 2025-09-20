import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { CompanyRoutineDetail, RoutineFilters } from '../types/routines';

interface UseRoutinesReturn {
  routines: CompanyRoutineDetail[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: RoutineFilters) => void;
  refreshRoutine: (companyRoutineId: string) => void;
}

export const useRoutines = (companyId: string): UseRoutinesReturn => {
  const [routines, setRoutines] = useState<CompanyRoutineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async (filters: RoutineFilters = {}) => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('company_routines_details')
        .select('*')
        .eq('company_id', companyId);

      // Apply filters
      if (filters.status) {
        query = query.eq('routine_status', filters.status);
      }

      if (filters.assigned_to) {
        query = query.eq('routine_assigned_to', filters.assigned_to);
      }

      if (filters.search) {
        query = query.or(
          `routine_title.ilike.%${filters.search}%,routine_description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order('routine_next_execution', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching routines:', error);
        setError(`Erro ao carregar rotinas: ${error.message}`);
        return;
      }

      setRoutines(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erro inesperado ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const refreshRoutine = useCallback(async (companyRoutineId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_routines_details')
        .select('*')
        .eq('company_routine_id', companyRoutineId)
        .single();

      if (error) {
        console.error('Error refreshing routine:', error);
        return;
      }

      if (data) {
        setRoutines(prev => 
          prev.map(routine => 
            routine.company_routine_id === companyRoutineId ? data : routine
          )
        );
      }
    } catch (err) {
      console.error('Error refreshing routine:', err);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return {
    routines,
    loading,
    error,
    refetch: fetchRoutines,
    refreshRoutine,
  };
};