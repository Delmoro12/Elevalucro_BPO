import axios from 'axios';
import { 
  CashFlowTransaction, 
  CashFlowIndicators, 
  CashFlowFilters,
  CashFlowApiResponse,
  CashFlowIndicatorsApiResponse 
} from '../types/cashFlow';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ========== CASH FLOW API ==========

export const cashFlowApi = {
  // Buscar transações de fluxo de caixa por empresa
  async getTransactions(companyId: string, filters: CashFlowFilters = {}): Promise<CashFlowTransaction[]> {
    try {
      console.log('🔍 Fetching cash flow transactions for company:', companyId);
      
      const params = new URLSearchParams();
      params.append('company_id', companyId);
      
      // Aplicar filtros
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.period) params.append('period', filters.period);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.financial_account_id && filters.financial_account_id !== 'all') {
        params.append('financial_account_id', filters.financial_account_id);
      }
      if (filters.category_id && filters.category_id !== 'all') {
        params.append('category_id', filters.category_id);
      }
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get<CashFlowApiResponse>(
        `${API_URL}/api/cash-flow/transactions?${params.toString()}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar transações de fluxo de caixa');
      }
      
      console.log('✅ Cash flow transactions fetched:', response.data.data.length);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erro ao buscar transações de fluxo de caixa:', error);
      throw error;
    }
  },

  // Buscar indicadores de fluxo de caixa por empresa
  async getIndicators(companyId: string): Promise<CashFlowIndicators> {
    try {
      console.log('📊 Fetching cash flow indicators for company:', companyId);
      
      const response = await axios.get<CashFlowIndicatorsApiResponse>(
        `${API_URL}/api/cash-flow/indicators?company_id=${companyId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar indicadores de fluxo de caixa');
      }
      
      console.log('✅ Cash flow indicators fetched:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erro ao buscar indicadores de fluxo de caixa:', error);
      throw error;
    }
  },

  // Exportar dados de fluxo de caixa (futuro)
  async exportTransactions(companyId: string, filters: CashFlowFilters = {}, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    try {
      console.log('📄 Exporting cash flow transactions for company:', companyId);
      
      const params = new URLSearchParams();
      params.append('company_id', companyId);
      params.append('format', format);
      
      // Aplicar filtros
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.period) params.append('period', filters.period);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      
      const response = await axios.get(
        `${API_URL}/api/cash-flow/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      
      console.log('✅ Cash flow export completed');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao exportar fluxo de caixa:', error);
      throw error;
    }
  }
};