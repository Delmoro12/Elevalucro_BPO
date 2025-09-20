import { AccountReceivable, AccountReceivableFormData, RecurrenceConfig } from '../types/accountsReceivable';

const BASE_URL = '/api/accounts-receivable';

export const accountsReceivableRecurrenceService = {
  // Criar conta com recorrência
  createRecurringAccount: async (
    formData: AccountReceivableFormData,
    companyId: string
  ): Promise<{ parentAccount: AccountReceivable; recurringAccounts: AccountReceivable[] }> => {
    // Primeiro criar a conta principal
    const createResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        company_id: companyId
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Erro ao criar conta principal');
    }

    const parentAccountData = await createResponse.json();
    const parentAccount = parentAccountData.data;

    // Se for única, retornar apenas a conta criada
    if (formData.occurrence === 'unique') {
      return {
        parentAccount,
        recurringAccounts: []
      };
    }

    // Preparar configuração de recorrência
    const recurrenceConfig: RecurrenceConfig = {
      type: formData.occurrence as any,
      day_of_week: formData.recurrence_day_of_week,
      day_of_month: formData.recurrence_day_of_month,
      installment_count: formData.installment_count,
      installment_day: formData.installment_day
    };

    // Chamar endpoint para gerar recorrência
    const recurringResponse = await fetch(`${BASE_URL}/generate-recurring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: parentAccount.id,
        occurrence_type: formData.occurrence,
        recurrence_config: recurrenceConfig
      }),
    });

    if (!recurringResponse.ok) {
      throw new Error('Erro ao gerar contas recorrentes');
    }

    const recurringData = await recurringResponse.json();
    
    return {
      parentAccount,
      recurringAccounts: recurringData.data || []
    };
  },

  // Editar série de contas recorrentes
  updateRecurringSeries: async (
    seriesId: string,
    updates: Partial<AccountReceivableFormData>,
    updateType: 'current' | 'future' | 'all'
  ): Promise<AccountReceivable[]> => {
    const response = await fetch(`${BASE_URL}/update-series`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        series_id: seriesId,
        updates,
        update_type: updateType
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar série de contas');
    }

    const data = await response.json();
    return data.data;
  },

  // Excluir série de contas recorrentes
  deleteRecurringSeries: async (
    seriesId: string,
    deleteType: 'current' | 'future' | 'all'
  ): Promise<{ deleted_count: number }> => {
    const response = await fetch(`${BASE_URL}/delete-series`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        series_id: seriesId,
        delete_type: deleteType
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir série de contas');
    }

    const data = await response.json();
    return data;
  },

  // Buscar contas da série
  getSeriesAccounts: async (seriesId: string): Promise<AccountReceivable[]> => {
    const response = await fetch(`${BASE_URL}/series/${seriesId}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar contas da série');
    }

    const data = await response.json();
    return data.data;
  }
};