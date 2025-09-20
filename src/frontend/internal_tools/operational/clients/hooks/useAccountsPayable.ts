import { useState, useEffect, useCallback } from 'react';
import { AccountPayable, AccountPayableFormData } from '../types/accountsPayable';
import { accountsPayableApi } from '../services/accountsPayable.api';
import { useAuth } from '../../../auth/contexts/AuthContext';

// Hook para Accounts Payable
export const useAccountsPayable = (companyId: string) => {
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccountsPayable = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await accountsPayableApi.getByCompany(companyId);
      setAccountsPayable(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createAccountPayable = async (data: AccountPayableFormData): Promise<AccountPayable | null> => {
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
      
      const newAccount = await accountsPayableApi.create(companyId, enhancedData, user?.id);
      await fetchAccountsPayable();
      return newAccount;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta a pagar');
      return null;
    }
  };

  const updateAccountPayable = async (id: string, data: Partial<AccountPayableFormData>): Promise<boolean> => {
    try {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }
      await accountsPayableApi.update(id, data, user.id);
      await fetchAccountsPayable();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar conta a pagar');
      return false;
    }
  };

  const deleteAccountPayable = async (id: string): Promise<boolean> => {
    try {
      await accountsPayableApi.delete(id);
      await fetchAccountsPayable();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar conta a pagar');
      return false;
    }
  };

  useEffect(() => {
    fetchAccountsPayable();
  }, [fetchAccountsPayable]);

  return {
    accountsPayable,
    loading,
    error,
    fetchAccountsPayable,
    createAccountPayable,
    updateAccountPayable,
    deleteAccountPayable
  };
};
