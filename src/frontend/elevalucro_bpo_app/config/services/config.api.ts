import axios from 'axios';
import { 
  FinancialCategory, 
  DREGroup, 
  FinancialAccount
} from '../types/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ========== FINANCIAL CATEGORIES (READ-ONLY) ==========

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
  }
};

// ========== DRE GROUPS (READ-ONLY) ==========

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
  }
};

// ========== FINANCIAL ACCOUNTS (READ-ONLY) ==========

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
  }
};