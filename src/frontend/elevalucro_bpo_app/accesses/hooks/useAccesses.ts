import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { 
  ClientAccess, 
  ClientAccessFormData, 
  ClientAccessFilters 
} from '../types/accesses';
import * as accessesApi from '../services/accesses.api';

export const useAccesses = () => {
  const { user, companyId, loading: authLoading } = useAuth();
  
  const [accesses, setAccesses] = useState<ClientAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientAccessFilters>({});

  // Buscar acessos
  const fetchAccesses = useCallback(async () => {
    if (!companyId || authLoading) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔑 [Hook] Fetching accesses for company:', companyId);

      const response = await accessesApi.listAccesses(filters);
      setAccesses(response.data);
      
      console.log('✅ [Hook] Accesses fetched successfully:', response.data.length);
    } catch (err: any) {
      console.error('❌ [Hook] Error fetching accesses:', err);
      setError(err.message || 'Erro ao carregar acessos');
      setAccesses([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, authLoading, filters]);

  // Criar acesso
  const createAccess = useCallback(async (accessData: ClientAccessFormData): Promise<boolean> => {
    if (!companyId) {
      setError('Company ID não encontrado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔑 [Hook] Creating access');

      await accessesApi.createAccess(accessData);
      
      // Recarregar lista
      await fetchAccesses();
      
      console.log('✅ [Hook] Access created successfully');
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Error creating access:', err);
      setError(err.message || 'Erro ao criar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [companyId, fetchAccesses]);

  // Atualizar acesso
  const updateAccess = useCallback(async (id: string, accessData: Partial<ClientAccessFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 [Hook] Updating access:', id);

      await accessesApi.updateAccess(id, accessData);
      
      // Recarregar lista
      await fetchAccesses();
      
      console.log('✅ [Hook] Access updated successfully');
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Error updating access:', err);
      setError(err.message || 'Erro ao atualizar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccesses]);

  // Deletar acesso
  const deleteAccess = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 [Hook] Deleting access:', id);

      await accessesApi.deleteAccess(id);
      
      // Recarregar lista
      await fetchAccesses();
      
      console.log('✅ [Hook] Access deleted successfully');
      return true;
    } catch (err: any) {
      console.error('❌ [Hook] Error deleting access:', err);
      setError(err.message || 'Erro ao deletar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccesses]);

  // Buscar acesso por ID
  const getAccessById = useCallback((id: string): ClientAccess | undefined => {
    return accesses.find(access => access.id === id);
  }, [accesses]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ClientAccessFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Efeito para carregar dados quando companyId ou filtros mudam
  useEffect(() => {
    if (companyId && !authLoading) {
      fetchAccesses();
    }
  }, [fetchAccesses]);

  return {
    // Dados
    accesses,
    loading: loading || authLoading,
    error,
    filters,

    // Metadados
    total: accesses.length,
    hasAccesses: accesses.length > 0,

    // Auth info
    user,
    companyId,
    isAuthenticated: !!user && !!companyId,

    // Ações CRUD
    fetchAccesses,
    createAccess,
    updateAccess,
    deleteAccess,
    getAccessById,

    // Filtros
    updateFilters,
    clearFilters,
  };
};