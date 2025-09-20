import { useState, useEffect } from 'react';
import { CompanyRoutine, RoutineFilters } from '../types/routines';
import { fetchAllRoutines } from '../services/routines.api';

export const useRoutines = () => {
  const [routines, setRoutines] = useState<CompanyRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = async (filters?: RoutineFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllRoutines(filters);
      setRoutines(data);
    } catch (err: any) {
      console.error('Erro ao buscar rotinas:', err);
      setError(err.message || 'Erro ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  return {
    routines,
    loading,
    error,
    fetchRoutines
  };
};