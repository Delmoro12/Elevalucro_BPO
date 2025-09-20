import { ReconciliationRecord, ReconciliationValidationRequest } from '../types/recordConciliation';
import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = '/api/record-conciliation';

// Helper para headers de autenticação
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

export const recordConciliationApi = {
  // Buscar registros por empresa para conciliação
  getByCompany: async (companyId: string): Promise<ReconciliationRecord[]> => {
    try {
      const headers = await getAuthHeaders();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      // URL com múltiplos parâmetros para evitar cache
      const url = `${API_BASE_URL}/company/${companyId}?t=${timestamp}&r=${randomId}&nocache=true`;
      
      const response = await fetch(url, {
        headers: {
          ...headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar registros para conciliação');
      }
      
      console.log(`🔍 API Service: Received ${data.data?.length || 0} records from server for company ${companyId}`);
      
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar registros para conciliação:', error);
      throw error;
    }
  },

  // Validar registro
  validate: async (id: string, type: 'receivable' | 'payable', data: ReconciliationValidationRequest): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${type}/${id}/validate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao validar registro');
      }
    } catch (error) {
      console.error('Erro ao validar registro:', error);
      throw error;
    }
  },

  // Rejeitar registro
  reject: async (id: string, type: 'receivable' | 'payable', reason: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${type}/${id}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          rejected_by: 'BPO Operator',
          rejection_reason: reason 
        }),
      });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao rejeitar registro');
      }
    } catch (error) {
      console.error('Erro ao rejeitar registro:', error);
      throw error;
    }
  }
};