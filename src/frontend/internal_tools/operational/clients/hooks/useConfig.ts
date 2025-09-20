import { useState, useEffect } from 'react';
import { FinancialCategory, DREGroup, FinancialAccount } from '../types/config';
import { financialCategoriesApi, dreGroupsApi, financialAccountsApi } from '../services/config.api';

export const useConfig = (companyId: string) => {
  const [financialCategories, setFinancialCategories] = useState<FinancialCategory[]>([]);
  const [dreGroups, setDREGroups] = useState<DREGroup[]>([]);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialCategories = async () => {
    if (!companyId) return;
    
    try {
      const data = await financialCategoriesApi.getByCompany(companyId);
      setFinancialCategories(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias financeiras:', err);
      setError(err.message || 'Erro ao carregar categorias financeiras');
    }
  };

  const fetchDREGroups = async () => {
    if (!companyId) return;
    
    try {
      const data = await dreGroupsApi.getByCompany(companyId);
      setDREGroups(data);
    } catch (err: any) {
      console.error('Erro ao carregar grupos DRE:', err);
      setError(err.message || 'Erro ao carregar grupos DRE');
    }
  };

  const fetchFinancialAccounts = async () => {
    if (!companyId) return;
    
    try {
      const data = await financialAccountsApi.getByCompany(companyId);
      setFinancialAccounts(data);
    } catch (err: any) {
      console.error('Erro ao carregar contas financeiras:', err);
      setError(err.message || 'Erro ao carregar contas financeiras');
    }
  };

  const fetchAll = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchFinancialCategories(),
      fetchDREGroups(),
      fetchFinancialAccounts()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [companyId]);

  return {
    financialCategories,
    dreGroups,
    financialAccounts,
    loading,
    error,
    fetchFinancialCategories,
    fetchDREGroups,
    fetchFinancialAccounts,
    fetchAll
  };
};