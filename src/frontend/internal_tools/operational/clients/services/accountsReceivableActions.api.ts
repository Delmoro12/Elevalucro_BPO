import { AccountReceivable } from '../types/accountsReceivable';

const BASE_URL = '/api/accounts-receivable';

export const accountsReceivableActionsApi = {
  // Processar recebimento completo (atualiza conta + cria movimentação)
  processReceipt: async (id: string, receiptData: {
    financial_account_id: string;
    receipt_date: string;
    received_amount: number;
    notes?: string;
  }): Promise<AccountReceivable> => {
    const response = await fetch(`${BASE_URL}/${id}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    });

    if (!response.ok) {
      throw new Error('Erro ao processar recebimento');
    }

    const data = await response.json();
    return data.data;
  },

  // Marcar como recebida (mudar status para received) - DEPRECATED: use processReceipt
  markAsReceived: async (id: string): Promise<AccountReceivable> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'received'
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar conta como recebida');
    }

    const data = await response.json();
    return data.data;
  },

  // Cancelar conta (mudar status para cancelled)
  markAsCancelled: async (id: string): Promise<AccountReceivable> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled'
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao cancelar conta');
    }

    const data = await response.json();
    return data.data;
  },

  // Estornar recebimento (reverter status + deletar movimentação)
  reverseReceipt: async (id: string): Promise<AccountReceivable> => {
    const response = await fetch(`${BASE_URL}/${id}/reverse-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao estornar recebimento');
    }

    const data = await response.json();
    return data.data;
  },

  // Clonar conta (criar nova baseada na existente)
  cloneAccount: async (id: string): Promise<AccountReceivable> => {
    // Primeiro, buscar a conta original
    const getResponse = await fetch(`${BASE_URL}/${id}`);
    
    if (!getResponse.ok) {
      throw new Error('Erro ao buscar conta para clonar');
    }

    const originalData = await getResponse.json();
    const original = originalData.data;

    // Preparar dados para clonagem - manter apenas os campos que existem na tabela accounts_receivable
    const cloneData = {
      company_id: original.company_id,
      pix_number: original.pix_number,
      bank_slip_code: original.bank_slip_code,
      payment_method: original.payment_method,
      companies_clients_suppliers_id: original.companies_clients_suppliers_id,
      due_date: original.due_date,
      value: original.value,
      date_of_issue: original.date_of_issue,
      number_of_document: original.number_of_document,
      notes: original.notes,
      category_id: original.category_id,
      occurrence: original.occurrence || 'unique',
      status: 'pending' // Sempre resetar para pending
    };
    
    // Ajustar data de vencimento (adicionar 30 dias)
    if (cloneData.due_date) {
      const originalDate = new Date(cloneData.due_date);
      const newDate = new Date(originalDate);
      newDate.setDate(originalDate.getDate() + 30);
      cloneData.due_date = newDate.toISOString().split('T')[0];
    }

    // Criar a nova conta
    const createResponse = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cloneData),
    });

    if (!createResponse.ok) {
      throw new Error('Erro ao clonar conta');
    }

    const newAccountData = await createResponse.json();
    return newAccountData.data;
  },

  // Excluir conta
  deleteAccount: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir conta');
    }
  }
};