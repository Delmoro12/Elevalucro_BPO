'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AccountPayableSummary,
  AccountPayableSummaryApiResponse,
  UseAccountsPayableSummaryResult
} from '../types/accountsPayable';

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/accounts-payable';

// Hook para buscar resumo de contas a pagar
export const useAccountsPayableSummary = (companyId: string): UseAccountsPayableSummaryResult => {
  const [summary, setSummary] = useState<AccountPayableSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar resumo
  const fetchSummary = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const url = new URL(`${API_BASE}/summary`, window.location.origin);
      url.searchParams.append('company_id', companyId);

      const response = await fetch(url.toString());
      const result: AccountPayableSummaryApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar resumo de contas a pagar');
      }

      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar resumo:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};