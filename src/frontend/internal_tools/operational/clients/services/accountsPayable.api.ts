import axios from 'axios';
import { AccountPayable, AccountPayableFormData, AccountsPayableSummary } from '../types/accountsPayable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ========== ACCOUNTS PAYABLE API ==========

export const accountsPayableApi = {
  // Listar contas a pagar por empresa
  async getByCompany(companyId: string): Promise<AccountPayable[]> {
    try {
      const response = await axios.get(`${API_URL}/api/accounts-payable?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      throw error;
    }
  },

  // Criar conta a pagar
  async create(companyId: string, data: AccountPayableFormData, userId?: string): Promise<AccountPayable> {
    try {
      const response = await axios.post(`${API_URL}/api/accounts-payable`, {
        ...data,
        company_id: companyId,
        user_id: userId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      throw error;
    }
  },

  // Atualizar conta a pagar
  async update(id: string, data: Partial<AccountPayableFormData>, userId?: string): Promise<AccountPayable> {
    try {
      const response = await axios.patch(`${API_URL}/api/accounts-payable/${id}`, {
        ...data,
        user_id: userId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
      throw error;
    }
  },

  // Deletar conta a pagar
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/accounts-payable/${id}`);
    } catch (error) {
      console.error('Erro ao deletar conta a pagar:', error);
      throw error;
    }
  },

  // Buscar resumo de indicadores por empresa
  async getSummary(companyId: string): Promise<AccountsPayableSummary> {
    try {
      const response = await axios.get(`${API_URL}/api/accounts-payable/summary?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar resumo de contas a pagar:', error);
      throw error;
    }
  }
};
