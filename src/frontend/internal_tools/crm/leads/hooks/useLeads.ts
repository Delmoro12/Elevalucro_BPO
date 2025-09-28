import { useState, useEffect } from 'react';
import { LeadListItem, LeadFilters, LeadKanbanStage } from '../types/leads';
import { getLeads, deleteLead, updateLeadKanbanStage } from '../services/leadsCrud';

export function useLeads() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});

  const fetchLeads = async (currentFilters?: LeadFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = currentFilters || filters;
      const response = await getLeads(filtersToUse);
      setLeads(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao deletar lead:', err);
      return false;
    }
  };

  const handleUpdateKanbanStage = async (id: string, newKanbanStage: LeadKanbanStage) => {
    try {
      const success = await updateLeadKanbanStage(id, newKanbanStage);
      
      if (success) {
        setLeads(prev => prev.map(lead => 
          lead.id === id 
            ? { ...lead, kanban_stage: newKanbanStage, updated_at: new Date().toISOString() }
            : lead
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Erro ao atualizar estágio:', err);
      return false;
    }
  };

  const updateFilters = (newFilters: LeadFilters) => {
    setFilters(newFilters);
    fetchLeads(newFilters);
  };

  const refreshLeads = () => {
    fetchLeads();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    error,
    filters,
    updateFilters,
    deleteLead: handleDeleteLead,
    updateKanbanStage: handleUpdateKanbanStage,
    refreshLeads,
  };
}