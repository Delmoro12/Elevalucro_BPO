import { CashMovement, CashMovementFormData } from '../types/cashMovements';

const API_BASE_URL = '/api/cash-movements';

export const cashMovementsApi = {
  // Buscar movimentações por empresa
  async getByCompany(companyId: string): Promise<CashMovement[]> {
    const response = await fetch(`${API_BASE_URL}?company_id=${companyId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar movimentações');
    }
    
    const data = await response.json();
    return data.data || [];
  },

  // Criar nova movimentação
  async create(companyId: string, formData: CashMovementFormData): Promise<CashMovement> {
    console.log('🔍 API Service - Criando movimentação com dados:', {
      ...formData,
      company_id: companyId
    });
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        company_id: companyId
      }),
    });
    
    console.log('📡 API Service - Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Service - Erro da API:', errorData);
      throw new Error(errorData.error || 'Erro ao criar movimentação');
    }
    
    const data = await response.json();
    console.log('✅ API Service - Movimentação criada:', data);
    return data.data;
  },

  // Atualizar movimentação
  async update(id: string, formData: Partial<CashMovementFormData>): Promise<CashMovement> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar movimentação');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Deletar movimentação
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Erro ao deletar movimentação');
    }
  },

  // Buscar saldo atual de uma conta
  async getAccountBalance(accountId: string): Promise<{ balance: number }> {
    const response = await fetch(`${API_BASE_URL}/balance/${accountId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar saldo');
    }
    
    const data = await response.json();
    return data;
  }
};