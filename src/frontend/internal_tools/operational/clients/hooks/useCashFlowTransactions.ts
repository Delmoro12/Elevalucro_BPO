import { useState, useEffect, useCallback } from 'react';
import { CashFlowTransaction, CashFlowFilters } from '../types/cashFlow';
import { cashFlowApi } from '../services/cashFlow.api';

export const useCashFlowTransactions = (companyId: string) => {
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CashFlowFilters>({});

  // Função para buscar transações
  const fetchTransactions = useCallback(async () => {
    if (!companyId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await cashFlowApi.getTransactions(companyId, filters);
      setTransactions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  // Buscar dados quando companyId ou filtros mudarem
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<CashFlowFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Função para refetch manual
  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch
  };
};