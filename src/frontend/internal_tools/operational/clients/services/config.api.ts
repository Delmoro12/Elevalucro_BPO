import axios from 'axios';
import { 
  FinancialCategory, 
  FinancialCategoryFormData,
  DREGroup, 
  DREGroupFormData,
  FinancialAccount,
  FinancialAccountFormData
} from '../types/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ========== FINANCIAL CATEGORIES ==========

export const financialCategoriesApi = {
  // Listar categorias por empresa
  async getByCompany(companyId: string): Promise<FinancialCategory[]> {
    try {
      const response = await axios.get(`${API_URL}/api/financial-categories?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar categorias financeiras:', error);
      throw error;
    }
  },

  // Criar categoria
  async create(companyId: string, data: FinancialCategoryFormData): Promise<FinancialCategory> {
    try {
      const response = await axios.post(`${API_URL}/api/financial-categories`, {
        ...data,
        company_id: companyId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar categoria financeira:', error);
      throw error;
    }
  },

  // Atualizar categoria
  async update(id: string, data: Partial<FinancialCategoryFormData>): Promise<FinancialCategory> {
    try {
      const response = await axios.patch(`${API_URL}/api/financial-categories/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria financeira:', error);
      throw error;
    }
  },

  // Deletar categoria
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/financial-categories/${id}`);
    } catch (error) {
      console.error('Erro ao deletar categoria financeira:', error);
      throw error;
    }
  }
};

// ========== DRE GROUPS ==========

export const dreGroupsApi = {
  // Listar grupos por empresa
  async getByCompany(companyId: string): Promise<DREGroup[]> {
    try {
      const response = await axios.get(`${API_URL}/api/dre-groups?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar grupos DRE:', error);
      throw error;
    }
  },

  // Criar grupo
  async create(companyId: string, data: DREGroupFormData): Promise<DREGroup> {
    try {
      const response = await axios.post(`${API_URL}/api/dre-groups`, {
        ...data,
        company_id: companyId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar grupo DRE:', error);
      throw error;
    }
  },

  // Atualizar grupo
  async update(id: string, data: Partial<DREGroupFormData>): Promise<DREGroup> {
    try {
      const response = await axios.patch(`${API_URL}/api/dre-groups/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar grupo DRE:', error);
      throw error;
    }
  },

  // Deletar grupo
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/dre-groups/${id}`);
    } catch (error) {
      console.error('Erro ao deletar grupo DRE:', error);
      throw error;
    }
  }
};

// ========== FINANCIAL ACCOUNTS ==========

export const financialAccountsApi = {
  // Listar contas por empresa
  async getByCompany(companyId: string): Promise<FinancialAccount[]> {
    try {
      const response = await axios.get(`${API_URL}/api/financial-accounts?company_id=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar contas financeiras:', error);
      throw error;
    }
  },

  // Criar conta
  async create(companyId: string, data: FinancialAccountFormData): Promise<FinancialAccount> {
    try {
      const response = await axios.post(`${API_URL}/api/financial-accounts`, {
        ...data,
        company_id: companyId
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar conta financeira:', error);
      throw error;
    }
  },

  // Atualizar conta
  async update(id: string, data: Partial<FinancialAccountFormData>): Promise<FinancialAccount> {
    try {
      const response = await axios.patch(`${API_URL}/api/financial-accounts/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar conta financeira:', error);
      throw error;
    }
  },

  // Deletar conta
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/financial-accounts/${id}`);
    } catch (error) {
      console.error('Erro ao deletar conta financeira:', error);
      throw error;
    }
  }
};