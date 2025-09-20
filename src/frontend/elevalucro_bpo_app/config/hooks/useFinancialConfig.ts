import { useState, useEffect, useCallback } from 'react';
import { 
  FinancialCategory, 
  DREGroup, 
  FinancialAccount
} from '../types/config';
import { 
  financialCategoriesApi, 
  dreGroupsApi, 
  financialAccountsApi 
} from '../services/config.api';

// Hook para Financial Categories (read-only)
export const useFinancialCategories = (companyId: string) => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await financialCategoriesApi.getByCompany(companyId);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories
  };
};

// Hook para DRE Groups (read-only)
export const useDREGroups = (companyId: string) => {
  const [groups, setGroups] = useState<DREGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await dreGroupsApi.getByCompany(companyId);
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups
  };
};

// Hook para Financial Accounts (read-only)
export const useFinancialAccounts = (companyId: string) => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await financialAccountsApi.getByCompany(companyId);
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts
  };
};