import { useState, useEffect } from 'react';
import { ProspectListItem, ProspectFilters, ProspectStatus } from '../types/prospects';
import { getProspects, deleteProspect, updateProspectStatus } from '../services/prospectsCrud';

export function useProspects() {
  const [prospects, setProspects] = useState<ProspectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProspectFilters>({});

  const fetchProspects = async (currentFilters?: ProspectFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = currentFilters || filters;
      const response = await getProspects(filtersToUse);
      setProspects(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar prospects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProspect = async (id: string) => {
    try {
      await deleteProspect(id);
      setProspects(prev => prev.filter(prospect => prospect.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao deletar prospect:', err);
      return false;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProspectStatus) => {
    try {
      const success = await updateProspectStatus(id, newStatus);
      
      if (success) {
        setProspects(prev => prev.map(prospect => 
          prospect.id === id 
            ? { ...prospect, status: newStatus, updated_at: new Date().toISOString() }
            : prospect
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return false;
    }
  };

  const updateFilters = (newFilters: ProspectFilters) => {
    setFilters(newFilters);
    fetchProspects(newFilters);
  };

  const refreshProspects = () => {
    fetchProspects();
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  return {
    prospects,
    loading,
    error,
    filters,
    updateFilters,
    deleteProspect: handleDeleteProspect,
    updateStatus: handleUpdateStatus,
    refreshProspects,
  };
}