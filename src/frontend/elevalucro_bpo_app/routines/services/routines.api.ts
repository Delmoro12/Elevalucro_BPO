import type { RoutinesHistoryFilters, RoutinesHistoryResponse } from '../types/routines';
import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = '/api/elevalucro-bpo-app/routines';

// Helper function to get authorization headers (seguindo padrão da app)
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

export const routinesApi = {
  /**
   * Lista o histórico de execuções de rotinas para a empresa
   */
  async listRoutinesHistory(
    companyId: string,
    filters: RoutinesHistoryFilters = {},
    page: number = 1,
    pageSize: number = 25
  ): Promise<RoutinesHistoryResponse> {
    try {
      const params = new URLSearchParams({
        company_id: companyId,
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/history?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar histórico de rotinas');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching routines history:', error);
      throw error;
    }
  },

  /**
   * Exporta o histórico de rotinas (funcionalidade futura)
   */
  async exportRoutinesHistory(
    filters: RoutinesHistoryFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        format,
        ...(filters.search && { search: filters.search }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const response = await fetch(`${API_BASE_URL}/history/export?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting routines history:', error);
      throw error;
    }
  }
};