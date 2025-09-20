import axios from 'axios';
import { AccountReceivable, AccountReceivableFormData, AccountsReceivableSummary } from '../types/accountsReceivable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ========== ACCOUNTS RECEIVABLE API ==========

export const accountsReceivableApi = {
  // Listar contas a receber por empresa
  async getByCompany(companyId: string): Promise<AccountReceivable[]> {
    try {
      const response = await axios.get(`${API_URL}/api/accounts-receivable?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      throw error;
    }
  },

  // Criar conta a receber
  async create(companyId: string, data: AccountReceivableFormData, userId?: string): Promise<AccountReceivable> {
    try {
      const response = await axios.post(`${API_URL}/api/accounts-receivable`, {
        ...data,
        company_id: companyId,
        user_id: userId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
      throw error;
    }
  },

  // Atualizar conta a receber
  async update(id: string, data: Partial<AccountReceivableFormData>, userId?: string): Promise<AccountReceivable> {
    try {
      const response = await axios.patch(`${API_URL}/api/accounts-receivable/${id}`, {
        ...data,
        user_id: userId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar conta a receber:', error);
      throw error;
    }
  },

  // Deletar conta a receber
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/accounts-receivable/${id}`);
    } catch (error) {
      console.error('Erro ao deletar conta a receber:', error);
      throw error;
    }
  },

  // Buscar resumo de indicadores por empresa
  async getSummary(companyId: string): Promise<AccountsReceivableSummary> {
    try {
      const response = await axios.get(`${API_URL}/api/accounts-receivable/summary?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar resumo de contas a receber:', error);
      throw error;
    }
  }
};