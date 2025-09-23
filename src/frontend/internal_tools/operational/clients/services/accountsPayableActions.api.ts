import { AccountPayable } from '../types/accountsPayable';
import { supabase } from '@/src/lib/supabase';

const BASE_URL = '/api/accounts-payable';

export const accountsPayableActionsApi = {
  // Processar pagamento completo (atualiza conta + cria movimentação)
  processPayment: async (id: string, paymentData: {
    financial_account_id: string;
    payment_date: string;
    paid_amount: number;
    notes?: string;
  }): Promise<AccountPayable> => {
    const response = await fetch(`${BASE_URL}/${id}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Erro ao processar pagamento');
    }

    const data = await response.json();
    return data.data;
  },

  // Pagar conta (mudar status para paid) - DEPRECATED: use processPayment
  markAsPaid: async (id: string): Promise<AccountPayable> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'paid'
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar conta como paga');
    }

    const data = await response.json();
    return data.data;
  },

  // Cancelar conta (mudar status para cancelled)
  markAsCancelled: async (id: string): Promise<AccountPayable> => {
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

  // Estornar pagamento (reverter status + deletar movimentação)
  reversePayment: async (id: string): Promise<AccountPayable> => {
    const response = await fetch(`${BASE_URL}/${id}/reverse-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao estornar pagamento');
    }

    const data = await response.json();
    return data.data;
  },

  // Clonar conta (criar nova baseada na existente)
  cloneAccount: async (id: string): Promise<AccountPayable> => {
    // Obter o usuário atual da sessão
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Primeiro, buscar a conta original
    const getResponse = await fetch(`${BASE_URL}/${id}`);
    
    if (!getResponse.ok) {
      throw new Error('Erro ao buscar conta para clonar');
    }

    const originalData = await getResponse.json();
    const original = originalData.data;

    // Preparar dados para clonagem - manter apenas os campos que existem na tabela accounts_payable
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
      status: 'pending', // Sempre resetar para pending
      // Adicionar campos de validação e auditoria
      created_by_side: 'bpo_side',
      validated: true, // BPO já valida ao clonar
      validated_at: new Date().toISOString(),
      validated_by: currentUserId,
      user_id: currentUserId // Para created_by
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