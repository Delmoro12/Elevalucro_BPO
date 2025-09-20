import { useState, useEffect } from 'react';

// Interface para conta financeira
export interface FinancialAccount {
  id: string;
  description: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/financial-accounts';

export const useFinancialAccounts = (companyId: string) => {
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialAccounts = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = new URL(API_BASE, window.location.origin);
        
        // Adicionar company_id apenas se fornecido
        if (companyId) {
          url.searchParams.append('company_id', companyId);
        }

        const response = await fetch(url.toString());
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao buscar contas financeiras');
        }

        if (result.success) {
          setFinancialAccounts(result.data || []);
        } else {
          setFinancialAccounts([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar contas financeiras:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialAccounts();
  }, [companyId]);

  return {
    financialAccounts,
    loading,
    error
  };
};