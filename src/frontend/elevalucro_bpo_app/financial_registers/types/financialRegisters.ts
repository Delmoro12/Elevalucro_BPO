export type FinancialRegisterType = 'receivable' | 'payable';
export type FinancialRegisterStatusTab = 'all' | 'not_validated' | 'validated' | 'receivable' | 'payable';

export interface FinancialRegister {
  id: string;
  company_id: string;
  type: FinancialRegisterType; // Será determinado pela tabela de origem
  
  // Informações de pagamento
  pix_number?: string;
  bank_slip_code?: string;
  payment_method?: string;
  
  // Cliente/Fornecedor
  companies_clients_suppliers_id?: string;
  supplier_name?: string; // Campo específico para contas a pagar
  client_name?: string; // Campo específico para contas a receber
  third_party_name?: string; // Campo unificado da view
  
  // Informações financeiras
  due_date?: string;
  due_date_formatted?: string; // Campo formatado da view
  value?: number;
  value_formatted?: string; // Campo formatado da view
  date_of_issue?: string;
  date_of_issue_formatted?: string; // Campo formatado da view
  number_of_document?: string;
  notes?: string;
  
  // Status de vencimento (calculado pela view)
  status_vencimento?: string; // vencida, vence_em_breve, em_dia, sem_data
  dias_vencimento?: number; // Dias até vencimento (negativo se vencida)
  
  // Categoria
  category_id?: string;
  category_name?: string; // Campo virtual vindo do JOIN
  
  // Outros campos
  occurrence?: string;
  status?: string; // Status original da conta (pending, paid, etc)
  
  // Campos de validação BPO
  created_by_side?: 'bpo_side' | 'client_side';
  validated: boolean;
  validated_at?: string;
  validated_by?: string;
  validated_by_name?: string; // Nome do usuário que validou
  
  // Campos de pagamento/recebimento
  payment_date?: string;
  receipt_date?: string;
  paid_amount?: number;
  received_amount?: number;
  financial_account_id?: string;
  financial_account_name?: string; // Campo virtual vindo do JOIN
  
  // Recorrência
  parent_account_id?: string;
  series_id?: string;
  recurrence_config?: any;
  installment_number?: number;
  installment_total?: number;
  installment_count?: number;
  recurrence_day_of_week?: string;
  recurrence_day_of_month?: number;
  installment_day?: number;
  
  // Documentos
  documents?: any[]; // Array JSON com documentos anexados
  
  // Campos de busca
  search_text?: string; // Campo de busca da view
  
  // Auditoria
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface FinancialRegisterFormData {
  type: FinancialRegisterType;
  pix_number?: string;
  bank_slip_code?: string;
  payment_method?: string;
  companies_clients_suppliers_id?: string;
  due_date?: string;
  value?: number;
  date_of_issue?: string;
  number_of_document?: string;
  notes?: string;
  category_id?: string;
  occurrence?: string;
  status?: string;
  payment_date?: string;
  paid_amount?: number;
  financial_account_id?: string;
  
  // Campos de recorrência para o formulário
  recurrence_day_of_week?: string;
  recurrence_day_of_month?: number;
  installment_count?: number;
  installment_day?: number;
  
  recurrence_config?: any;
  documents?: any[];
}