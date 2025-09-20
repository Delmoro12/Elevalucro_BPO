import { useState, useEffect, useCallback } from 'react';
import { FinancialCategory } from '../../shared/types/config';

// Hook simples para buscar categorias financeiras
export const useFinancialCategories = (companyId: string) => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/financial-categories?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }
      const result = await response.json();
      setCategories(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
      setCategories([]);
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