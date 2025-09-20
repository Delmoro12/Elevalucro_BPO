import { FinancialRegister, FinancialRegisterFormData } from '../types/financialRegisters';
import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = '/api/elevalucro-bpo-app';

// Helper function to get authorization headers
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

export const financialRegistersApi = {
  // Buscar registros client_side por empresa (validados e não validados)
  getByCompany: async (companyId: string): Promise<FinancialRegister[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/financial-registers?company_id=${companyId}`, {
        headers
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar registros financeiros');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar registros financeiros:', error);
      throw error;
    }
  },

  // Criar novo registro (sempre com validated = false)
  create: async (companyId: string, formData: FinancialRegisterFormData): Promise<FinancialRegister> => {
    try {
      const endpoint = formData.type === 'receivable' ? 'accounts-receivable' : 'accounts-payable';
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          created_by_side: 'client_side', // Registros criados pelo cliente BPO
          validated: false, // Sempre criar como não validado
          validated_at: null,
          validated_by: null
        }),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar registro financeiro');
      }
      
      return {
        ...data.data,
        type: formData.type // Adicionar tipo baseado na tabela
      };
    } catch (error) {
      console.error('Erro ao criar registro financeiro:', error);
      throw error;
    }
  },

  // Atualizar registro
  update: async (id: string, formData: Partial<FinancialRegisterFormData>, type: 'receivable' | 'payable'): Promise<FinancialRegister> => {
    try {
      const endpoint = type === 'receivable' ? 'accounts-receivable' : 'accounts-payable';
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao atualizar registro financeiro');
      }
      
      return {
        ...data.data,
        type
      };
    } catch (error) {
      console.error('Erro ao atualizar registro financeiro:', error);
      throw error;
    }
  },

  // Deletar registro
  delete: async (id: string, type: 'receivable' | 'payable'): Promise<void> => {
    try {
      const endpoint = type === 'receivable' ? 'accounts-receivable' : 'accounts-payable';
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao excluir registro financeiro');
      }
    } catch (error) {
      console.error('Erro ao excluir registro financeiro:', error);
      throw error;
    }
  },

  // Validar registro (marcar como validated = true)
  validate: async (id: string, type: 'receivable' | 'payable'): Promise<FinancialRegister> => {
    try {
      const endpoint = type === 'receivable' ? 'accounts-receivable' : 'accounts-payable';
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}/validate`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          validated: true,
          validated_at: new Date().toISOString()
        }),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao validar registro');
      }
      
      return {
        ...data.data,
        type
      };
    } catch (error) {
      console.error('Erro ao validar registro:', error);
      throw error;
    }
  }
};