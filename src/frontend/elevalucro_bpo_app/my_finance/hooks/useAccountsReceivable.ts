'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AccountReceivable,
  CreateAccountReceivableRequest,
  UpdateAccountReceivableRequest,
  ProcessReceiptRequest,
  AccountReceivableApiResponse,
  UseAccountsReceivableResult,
  AccountReceivableFilters
} from '../types/accountsReceivable';

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/accounts-receivable';

// Hook principal para gerenciar contas a receber
export const useAccountsReceivable = (
  companyId: string,
  filters?: AccountReceivableFilters
): UseAccountsReceivableResult => {
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar contas a receber
  const fetchAccountsReceivable = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(API_BASE, window.location.origin);
      
      // Adicionar company_id apenas se fornecido
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString());
      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar contas a receber');
      }

      if (result.success && Array.isArray(result.data)) {
        setAccountsReceivable(result.data);
      } else {
        setAccountsReceivable([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar contas a receber:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAccountsReceivable();
  }, [fetchAccountsReceivable]);

  // Função para criar nova conta
  const createAccount = async (data: CreateAccountReceivableRequest): Promise<AccountReceivable> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta a receber');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta a receber';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para atualizar conta
  const updateAccount = async (data: UpdateAccountReceivableRequest): Promise<AccountReceivable> => {
    try {
      const response = await fetch(`${API_BASE}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar conta a receber');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta a receber';
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

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar conta a receber');
      }

      if (result.success) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return;
      }

      throw new Error('Erro ao deletar conta a receber');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar conta a receber';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para processar recebimento
  const processReceipt = async (id: string, receiptData: ProcessReceiptRequest): Promise<AccountReceivable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar recebimento');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar recebimento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para marcar como cancelada
  const markAsCancelled = async (id: string): Promise<AccountReceivable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/cancel`, {
        method: 'POST',
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cancelar conta');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
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
  const cloneAccount = async (id: string): Promise<AccountReceivable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/clone`, {
        method: 'POST',
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao clonar conta');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao clonar conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para estornar recebimento
  const reverseReceipt = async (id: string): Promise<AccountReceivable> => {
    try {
      const response = await fetch(`${API_BASE}/${id}/reverse`, {
        method: 'POST',
      });

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao estornar recebimento');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchAccountsReceivable();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao estornar recebimento';
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

      const result: AccountReceivableApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar série');
      }

      if (result.success) {
        // Atualizar lista local
        await fetchAccountsReceivable();
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
    accountsReceivable,
    loading,
    error,
    refetch: fetchAccountsReceivable,
    createAccount,
    updateAccount,
    deleteAccount,
    processReceipt,
    markAsCancelled,
    cloneAccount,
    reverseReceipt,
    deleteSeries,
  };
};