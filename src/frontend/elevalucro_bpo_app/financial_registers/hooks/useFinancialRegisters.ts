import { useState, useEffect } from 'react';
import { FinancialRegister } from '../types/financialRegisters';
import { financialRegistersApi } from '../services/financialRegisters.api';

export const useFinancialRegisters = (companyId?: string) => {
  const [financialRegisters, setFinancialRegisters] = useState<FinancialRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialRegisters = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Busca registros client_side (validados e não validados)
        const data = await financialRegistersApi.getByCompany(companyId);
        setFinancialRegisters(data);
      } catch (err) {
        console.error('Erro ao buscar registros financeiros:', err);
        setError('Erro ao buscar registros financeiros');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialRegisters();
  }, [companyId]);

  const refetch = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await financialRegistersApi.getByCompany(companyId);
      setFinancialRegisters(data);
    } catch (err) {
      console.error('Erro ao buscar registros financeiros:', err);
      setError('Erro ao buscar registros financeiros');
    } finally {
      setLoading(false);
    }
  };

  // Função helper para filtrar por validação
  const getNotValidated = () => financialRegisters.filter(r => !r.validated);
  const getValidated = () => financialRegisters.filter(r => r.validated);

  return { 
    financialRegisters, 
    notValidatedRegisters: getNotValidated(),
    validatedRegisters: getValidated(),
    loading, 
    error,
    refetch
  };
};