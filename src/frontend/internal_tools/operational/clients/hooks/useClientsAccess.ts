import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  ClientAccess, 
  ClientAccessCreatePayload, 
  ClientAccessUpdatePayload,
  ClientAccessFilters 
} from '../types/access';

export const useClientsAccess = (companyId?: string) => {
  const [access, setAccess] = useState<ClientAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientAccessFilters>({});

  // Buscar acessos
  const fetchAccess = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Fetching client access for company:', companyId);

      let query = supabase
        .from('clients_access')
        .select(`
          *,
          created_by_user:created_by(full_name),
          updated_by_user:updated_by(full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,login.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Error fetching client access:', fetchError);
        throw new Error(`Failed to fetch client access: ${fetchError.message}`);
      }

      // Mapear dados incluindo nomes dos usuários
      const mappedAccess: ClientAccess[] = (data || []).map(item => ({
        id: item.id,
        company_id: item.company_id,
        description: item.description,
        login: item.login,
        password: item.password,
        url: item.url,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_by: item.updated_by,
        updated_at: item.updated_at,
        created_by_name: item.created_by_user?.full_name,
        updated_by_name: item.updated_by_user?.full_name,
      }));

      setAccess(mappedAccess);
      console.log('✅ Client access fetched:', mappedAccess.length);
    } catch (err: any) {
      console.error('Error fetching client access:', err);
      setError(err.message || 'Erro ao carregar acessos');
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  // Criar acesso
  const createAccess = useCallback(async (payload: ClientAccessCreatePayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Creating client access:', payload);

      // Buscar o usuário atual para auditoria
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: createError } = await supabase
        .from('clients_access')
        .insert({
          ...payload,
          created_by: user?.id,
          updated_by: user?.id,
        });

      if (createError) {
        console.error('❌ Error creating client access:', createError);
        throw new Error(`Failed to create client access: ${createError.message}`);
      }

      console.log('✅ Client access created successfully');
      await fetchAccess(); // Recarregar lista
      return true;
    } catch (err: any) {
      console.error('Error creating client access:', err);
      setError(err.message || 'Erro ao criar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccess]);

  // Atualizar acesso
  const updateAccess = useCallback(async (id: string, payload: ClientAccessUpdatePayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Updating client access:', id, payload);

      // Buscar o usuário atual para auditoria
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('clients_access')
        .update({
          ...payload,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Error updating client access:', updateError);
        throw new Error(`Failed to update client access: ${updateError.message}`);
      }

      console.log('✅ Client access updated successfully');
      await fetchAccess(); // Recarregar lista
      return true;
    } catch (err: any) {
      console.error('Error updating client access:', err);
      setError(err.message || 'Erro ao atualizar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccess]);

  // Deletar acesso
  const deleteAccess = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Deleting client access:', id);

      const { error: deleteError } = await supabase
        .from('clients_access')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error deleting client access:', deleteError);
        throw new Error(`Failed to delete client access: ${deleteError.message}`);
      }

      console.log('✅ Client access deleted successfully');
      await fetchAccess(); // Recarregar lista
      return true;
    } catch (err: any) {
      console.error('Error deleting client access:', err);
      setError(err.message || 'Erro ao deletar acesso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccess]);

  // Buscar acesso por ID
  const getAccessById = useCallback((id: string): ClientAccess | undefined => {
    return access.find(item => item.id === id);
  }, [access]);

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
    if (companyId) {
      fetchAccess();
    }
  }, [fetchAccess]);

  return {
    // Dados
    access,
    loading,
    error,
    filters,

    // Ações
    fetchAccess,
    createAccess,
    updateAccess,
    deleteAccess,
    getAccessById,

    // Filtros
    updateFilters,
    clearFilters,

    // Utils
    total: access.length,
  };
};