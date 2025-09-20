'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AccountPayable,
  CreateAccountPayableRequest,
  UpdateAccountPayableRequest,
  ProcessPaymentRequest,
  AccountPayableApiResponse,
  UseAccountsPayableResult,
  AccountPayableFilters
} from '../types/accountsPayable';

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/accounts-payable';

// Hook principal para gerenciar contas a pagar
export const useAccountsPayable = (
  companyId: string,
  filters?: AccountPayableFilters
): UseAccountsPayableResult => {
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar contas a pagar
  const fetchAccountsPayable = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(API_BASE, window.location.origin);
      
      // Adicionar company_id apenas se fornecido
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString());
      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar contas a pagar');
      }

      if (result.success && Array.isArray(result.data)) {
        setAccountsPayable(result.data);
      } else {
        setAccountsPayable([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar contas a pagar:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAccountsPayable();
  }, [fetchAccountsPayable]);

  // Função para criar nova conta
  const createAccount = async (data: CreateAccountPayableRequest): Promise<AccountPayable> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta a pagar');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta a pagar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para atualizar conta
  const updateAccount = async (data: UpdateAccountPayableRequest): Promise<AccountPayable> => {
    try {
      const response = await fetch(`${API_BASE}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar conta a pagar');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta a pagar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para deletar conta
  const deleteAccount = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar conta a pagar');
      }

      if (result.success) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return;
      }

      throw new Error('Erro ao deletar conta a pagar');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar conta a pagar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para processar pagamento
  const processPayment = async (id: string, paymentData: ProcessPaymentRequest): Promise<AccountPayable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para marcar como cancelada
  const markAsCancelled = async (id: string): Promise<AccountPayable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/cancel`, {
        method: 'POST',
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cancelar conta');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para clonar conta
  const cloneAccount = async (id: string): Promise<AccountPayable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, {
        method: 'POST',
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao clonar conta');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao clonar conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para estornar pagamento
  const reversePayment = async (id: string): Promise<AccountPayable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/reverse`, {
        method: 'POST',
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao estornar pagamento');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao estornar pagamento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para deletar série
  const deleteSeries = async (seriesId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/series/${seriesId}`, {
        method: 'DELETE',
      });

      const result: AccountPayableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar série');
      }

      if (result.success) {
        // Atualizar lista local
        await fetchAccountsPayable();
        return;
      }

      throw new Error('Erro ao deletar série');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar série';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    accountsPayable,
    loading,
    error,
    refetch: fetchAccountsPayable,
    createAccount,
    updateAccount,
    deleteAccount,
    processPayment,
    markAsCancelled,
    cloneAccount,
    reversePayment,
    deleteSeries,
  };
};