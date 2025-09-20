import { useState, useEffect, useCallback } from 'react';
import { AccountReceivable, AccountReceivableFormData } from '../types/accountsReceivable';
import { accountsReceivableApi } from '../services/accountsReceivable.api';
import { useAuth } from '../../../auth/contexts/AuthContext';

// Hook para Accounts Receivable
export const useAccountsReceivable = (companyId: string) => {
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccountsReceivable = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await accountsReceivableApi.getByCompany(companyId);
      setAccountsReceivable(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createAccountReceivable = async (data: AccountReceivableFormData): Promise<AccountReceivable | null> => {
    try {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return null;
      }
      
      // Adicionar campos de validação BPO para internal tools
      const enhancedData = {
        ...data,
        created_by_side: 'bpo_side' as const,
        validated: true,
        validated_at: new Date().toISOString(),
        validated_by: user.id
      };
      
      const newAccount = await accountsReceivableApi.create(companyId, enhancedData, user?.id);
      await fetchAccountsReceivable();
      return newAccount;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta a receber');
      return null;
    }
  };

  const updateAccountReceivable = async (id: string, data: Partial<AccountReceivableFormData>): Promise<boolean> => {
    try {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }
      await accountsReceivableApi.update(id, data, user.id);
      await fetchAccountsReceivable();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar conta a receber');
      return false;
    }
  };

  const deleteAccountReceivable = async (id: string): Promise<boolean> => {
    try {
      await accountsReceivableApi.delete(id);
      await fetchAccountsReceivable();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar conta a receber');
      return false;
    }
  };

  useEffect(() => {
    fetchAccountsReceivable();
  }, [fetchAccountsReceivable]);

  return {
    accountsReceivable,
    loading,
    error,
    fetchAccountsReceivable,
    createAccountReceivable,
    updateAccountReceivable,
    deleteAccountReceivable
  };
};