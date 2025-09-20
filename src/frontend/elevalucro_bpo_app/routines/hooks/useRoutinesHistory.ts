import { useState, useCallback } from 'react';
import { routinesApi } from '../services/routines.api';
import type { 
  RoutineExecution, 
  RoutinesHistoryFilters, 
  UseRoutinesHistoryReturn 
} from '../types/routines';

export const useRoutinesHistory = (): UseRoutinesHistoryReturn => {
  const [routines, setRoutines] = useState<RoutineExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRoutines = useCallback(async (
    companyId: string,
    filters: RoutinesHistoryFilters = {},
    page: number = 1,
    pageSize: number = 25
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await routinesApi.listRoutinesHistory(companyId, filters, page, pageSize);
      
      setRoutines(response.data);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico de rotinas';
      setError(errorMessage);
      console.error('Error fetching routines history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRoutines = useCallback(async () => {
    // Recarrega com os mesmos filtros da última busca
    await fetchRoutines();
  }, [fetchRoutines]);

  return {
    routines,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    fetchRoutines,
    refreshRoutines
  };
};