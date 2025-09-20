import { useState, useEffect } from 'react';
import { ReconciliationRecord } from '../types/recordConciliation';
import { recordConciliationApi } from '../services/recordConciliation.api';

export const useRecordConciliation = (companyId?: string) => {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!companyId) {
        // Limpar dados quando não há companyId
        setRecords([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Limpar dados antigos antes de buscar novos
        setRecords([]);
        
        const data = await recordConciliationApi.getByCompany(companyId);
        console.log(`🔄 Hook: Fetched ${data.length} records for company ${companyId}`);
        setRecords(data);
      } catch (err) {
        console.error('Erro ao buscar registros para conciliação:', err);
        setError('Erro ao buscar registros para conciliação');
        setRecords([]); // Limpar dados em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [companyId, refreshKey]);

  const refetch = async () => {
    setRefreshKey(prev => prev + 1);
  };

  // Filtrar registros aguardando validação
  const getPendingRecords = () => records.filter(r => !r.validated && r.created_by_side === 'client_side');
  
  // Filtrar registros já validados
  const getValidatedRecords = () => records.filter(r => r.validated && r.created_by_side === 'client_side');

  // Estatísticas
  const getStats = () => {
    const pending = getPendingRecords();
    const validated = getValidatedRecords();
    
    return {
      total: pending.length + validated.length,
      pending: pending.length,
      validated: validated.length,
      pendingReceivables: pending.filter(r => r.type === 'receivable').length,
      pendingPayables: pending.filter(r => r.type === 'payable').length,
      totalValue: pending.reduce((sum, r) => sum + (r.value || 0), 0)
    };
  };

  return { 
    records, 
    pendingRecords: getPendingRecords(),
    validatedRecords: getValidatedRecords(),
    stats: getStats(),
    loading, 
    error,
    refetch
  };
};