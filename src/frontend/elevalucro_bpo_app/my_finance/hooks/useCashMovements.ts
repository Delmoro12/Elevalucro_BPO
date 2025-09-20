'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  CashMovement,
  CreateCashMovementRequest,
  UpdateCashMovementRequest,
  CashMovementApiResponse,
  UseCashMovementsResult,
  CashMovementFilters,
  AccountBalance,
  AccountBalanceApiResponse
} from '../types/cashMovements';

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/cash-movements';

// Hook principal para gerenciar movimentações de caixa
export const useCashMovements = (
  companyId: string,
  filters?: CashMovementFilters
): UseCashMovementsResult => {
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar movimentações de caixa
  const fetchCashMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(API_BASE, window.location.origin);
      
      // Adicionar company_id apenas se fornecido
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString());
      const result: CashMovementApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar movimentações de caixa');
      }

      if (result.success && Array.isArray(result.data)) {
        setCashMovements(result.data);
      } else {
        setCashMovements([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar movimentações de caixa:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchCashMovements();
  }, [fetchCashMovements]);

  // Função para criar nova movimentação
  const createMovement = async (data: CreateCashMovementRequest): Promise<CashMovement> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: CashMovementApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar movimentação de caixa');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchCashMovements();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar movimentação de caixa';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para atualizar movimentação
  const updateMovement = async (data: UpdateCashMovementRequest): Promise<CashMovement> => {
    try {
      const response = await fetch(`${API_BASE}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: CashMovementApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar movimentação de caixa');
      }

      if (result.success && result.data && !Array.isArray(result.data)) {
        // Atualizar lista local
        await fetchCashMovements();
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar movimentação de caixa';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para deletar movimentação
  const deleteMovement = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      const result: CashMovementApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar movimentação de caixa');
      }

      if (result.success) {
        // Atualizar lista local
        await fetchCashMovements();
        return;
      }

      throw new Error('Erro ao deletar movimentação de caixa');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar movimentação de caixa';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Função para buscar saldo de uma conta
  const getAccountBalance = async (accountId: string): Promise<AccountBalance> => {
    try {
      const response = await fetch(`${API_BASE}/balance/${accountId}`);
      const result: AccountBalanceApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar saldo da conta');
      }

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar saldo da conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    cashMovements,
    loading,
    error,
    refetch: fetchCashMovements,
    createMovement,
    updateMovement,
    deleteMovement,
    getAccountBalance,
  };
};