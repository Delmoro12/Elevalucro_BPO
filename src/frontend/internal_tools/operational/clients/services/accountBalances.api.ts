export interface AccountBalance {
  company_id: string;
  financial_account_id: string;
  account_name: string;
  current_balance: number;
}

class AccountBalancesApi {
  async getByCompany(companyId: string): Promise<AccountBalance[]> {
    try {
      console.log('🔍 API Service - Fetching account balances for company:', companyId);
      
      const response = await fetch(`/api/account-balances?company_id=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Service - Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ API Service - Account balances fetched:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar saldos das contas');
      }

      return result.data;
    } catch (error) {
      console.error('❌ API Service - Error fetching account balances:', error);
      throw error;
    }
  }
}

export const accountBalancesApi = new AccountBalancesApi();