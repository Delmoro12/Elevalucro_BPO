// ======================================
// Types: Accounts Receivable
// ======================================

export interface AccountReceivable {
  id: string;
  company_id: string;
  
  // Informações básicas da conta
  pix_number?: string;
  bank_slip_code?: string;
  payment_method: 'pix' | 'bank_slip' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'cash' | 'check';
  companies_clients_suppliers_id?: string;
  due_date: string;
  value: number;
  date_of_issue?: string;
  number_of_document?: string;
  notes?: string;
  occurrence: 'unique' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'installments';
  status: 'pending' | 'received' | 'cancelled';
  
  // Campos de recebimento (diferente de pagamento)
  receipt_date?: string;
  received_amount?: number;
  financial_account_id?: string;
  
  // Campos de recorrência
  parent_account_id?: string;
  series_id?: string;
  recurrence_config?: any;
  installment_number?: number;
  installment_total?: number;
  installment_day?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  
  // Dados do cliente (da view)
  client_name: string;
  client_email?: string;
  client_document?: string;
  client_type?: string;
  client_phone?: string;
  client_whatsapp?: string;
  client_pix?: string;
  
  // Dados da categoria financeira (da view)
  category_name: string;
  category_id?: string;
  
  // Grupo DRE (da view)
  dre_group_name?: string;
  dre_group_order?: number;
  
  // Status calculado baseado na data de vencimento (da view)
  status_vencimento: 'vencida' | 'vence_em_breve' | 'em_dia' | 'sem_data';
  
  // Dias até o vencimento (da view)
  dias_vencimento?: number;
  
  // Informações formatadas (da view)
  value_formatted: string;
  due_date_formatted: string;
  date_of_issue_formatted?: string;
  
  // Campos de auditoria
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  
  // Informações do usuário que criou (da view)
  created_by_email?: string;
  updated_by_email?: string;
  
  // Resumo da conta para busca (da view)
  search_text: string;
}

export interface AccountReceivableSummary {
  company_id: string;
  
  // Contadores por status
  total_contas: number;
  contas_vencidas: number;
  contas_vence_breve: number;
  contas_em_dia: number;
  contas_sem_data: number;
  
  // Valores por status
  valor_total: number;
  valor_vencido: number;
  valor_vence_breve: number;
  valor_em_dia: number;
  
  // Próximo vencimento
  proximo_vencimento?: string;
  
  // Média de valores
  valor_medio: number;
  
  // Contadores por método de pagamento
  contas_pix: number;
  contas_boleto: number;
  contas_transferencia: number;
  
  // Data da última atualização
  ultima_atualizacao?: string;
}

export interface CreateAccountReceivableRequest {
  company_id: string;
  pix_number?: string;
  bank_slip_code?: string;
  payment_method: 'pix' | 'bank_slip' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'cash' | 'check';
  companies_clients_suppliers_id?: string;
  due_date: string;
  value: number;
  date_of_issue?: string;
  number_of_document?: string;
  notes?: string;
  category_id?: string;
  occurrence?: 'unique' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'installments';
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  installment_count?: number;
  installment_day?: number;
}

export interface UpdateAccountReceivableRequest extends Partial<CreateAccountReceivableRequest> {
  id: string;
}

export interface ProcessReceiptRequest {
  financial_account_id: string;
  receipt_date: string;
  received_amount: number;
  notes?: string;
}

export interface AccountReceivableApiResponse {
  success: boolean;
  data?: AccountReceivable | AccountReceivable[];
  total?: number;
  error?: string;
  message?: string;
  recurring_accounts_created?: number;
}

export interface AccountReceivableSummaryApiResponse {
  success: boolean;
  data?: AccountReceivableSummary;
  error?: string;
}

// Tab types para filtros
export type AccountReceivableStatusTab = 'all' | 'open' | 'received' | 'overdue' | 'cancelled';

// Filter types
export interface AccountReceivableFilters {
  status?: AccountReceivableStatusTab;
  search?: string;
  category_id?: string;
  payment_method?: string;
  client_id?: string;
  date_filter?: {
    type: 'month' | 'specific' | 'range';
    month?: string;
    specificDate?: string;
    startDate?: string;
    endDate?: string;
  };
}

// Hook types
export interface UseAccountsReceivableResult {
  accountsReceivable: AccountReceivable[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAccount: (data: CreateAccountReceivableRequest) => Promise<AccountReceivable>;
  updateAccount: (data: UpdateAccountReceivableRequest) => Promise<AccountReceivable>;
  deleteAccount: (id: string) => Promise<void>;
  processReceipt: (id: string, receiptData: ProcessReceiptRequest) => Promise<AccountReceivable>;
  markAsCancelled: (id: string) => Promise<AccountReceivable>;
  cloneAccount: (id: string) => Promise<AccountReceivable>;
  reverseReceipt: (id: string) => Promise<AccountReceivable>;
  deleteSeries: (seriesId: string) => Promise<void>;
}

export interface UseAccountsReceivableSummaryResult {
  summary: AccountReceivableSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}