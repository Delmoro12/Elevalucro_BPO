import { useState, useEffect, useCallback } from 'react';
import { 
  FinancialCategory, 
  FinancialCategoryFormData,
  DREGroup, 
  DREGroupFormData,
  FinancialAccount,
  FinancialAccountFormData
} from '../types/config';
import { 
  financialCategoriesApi, 
  dreGroupsApi, 
  financialAccountsApi 
} from '../services/config.api';

// Hook para Financial Categories
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

  const createCategory = async (data: FinancialCategoryFormData): Promise<FinancialCategory | null> => {
    try {
      const newCategory = await financialCategoriesApi.create(companyId, data);
      await fetchCategories();
      return newCategory;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar categoria');
      return null;
    }
  };

  const updateCategory = async (id: string, data: Partial<FinancialCategoryFormData>): Promise<boolean> => {
    try {
      await financialCategoriesApi.update(id, data);
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar categoria');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await financialCategoriesApi.delete(id);
      await fetchCategories();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar categoria');
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

// Hook para DRE Groups
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

  const createGroup = async (data: DREGroupFormData): Promise<DREGroup | null> => {
    try {
      const newGroup = await dreGroupsApi.create(companyId, data);
      await fetchGroups();
      return newGroup;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar grupo');
      return null;
    }
  };

  const updateGroup = async (id: string, data: Partial<DREGroupFormData>): Promise<boolean> => {
    try {
      await dreGroupsApi.update(id, data);
      await fetchGroups();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar grupo');
      return false;
    }
  };

  const deleteGroup = async (id: string): Promise<boolean> => {
    try {
      await dreGroupsApi.delete(id);
      await fetchGroups();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar grupo');
      return false;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
};

// Hook para Financial Accounts
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

  const createAccount = async (data: FinancialAccountFormData): Promise<FinancialAccount | null> => {
    try {
      const newAccount = await financialAccountsApi.create(companyId, data);
      await fetchAccounts();
      return newAccount;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      return null;
    }
  };

  const updateAccount = async (id: string, data: Partial<FinancialAccountFormData>): Promise<boolean> => {
    try {
      await financialAccountsApi.update(id, data);
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar conta');
      return false;
    }
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    try {
      await financialAccountsApi.delete(id);
      await fetchAccounts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar conta');
      return false;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
};