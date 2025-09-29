// Types para contas a receber

export interface RecurrenceConfig {
  type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'installments';
  day_of_week?: string; // Para semanal/quinzenal
  day_of_month?: number; // Para mensal/trimestral/semestral/anual
  installment_count?: number; // Para parcelada
  installment_day?: number; // Dia do vencimento das parcelas
}

export interface AccountReceivable {
  id: string;
  company_id: string;
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
  status?: 'pending' | 'paid' | 'cancelled';
  
  // Campos de recorrência
  parent_account_id?: string;
  series_id?: string;
  recurrence_config?: RecurrenceConfig;
  installment_number?: number;
  installment_total?: number;
  installment_day?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  
  // Campos de validação BPO
  created_by_side?: 'bpo_side' | 'client_side';
  validated?: boolean;
  validated_at?: string;
  validated_by?: string;
  
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  
  // Campos enriquecidos via VIEW
  client_name?: string;
  client_email?: string;
  client_document?: string;
  client_type?: string;
  client_phone?: string;
  client_whatsapp?: string;
  client_pix?: string;
  category_name?: string;
  dre_group_name?: string;
  dre_group_order?: number;
  
  // Campos de recebimento
  payment_date?: string;
  paid_amount?: number;
  financial_account_id?: string;
  
  // Campos calculados pela VIEW
  status_vencimento?: 'vencida' | 'vence_em_breve' | 'em_dia' | 'sem_data';
  dias_vencimento?: number;
  value_formatted?: string;
  due_date_formatted?: string;
  date_of_issue_formatted?: string;
  payment_date_formatted?: string;
  paid_amount_formatted?: string;
  search_text?: string;
  
  // Informações da conta financeira (enriquecido via JOIN)
  financial_account_name?: string;
  
  // Campos de auditoria enriquecidos
  created_by_email?: string;
  updated_by_email?: string;
}

export interface AccountReceivableFormData {
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
  status?: 'pending' | 'paid' | 'cancelled';
  
  // Campos de recorrência para o formulário
  recurrence_day_of_week?: string;
  recurrence_day_of_month?: number;
  recurrence_count?: number; // Quantas vezes repetir a recorrência
  installment_count?: number;
  installment_day?: number;
  
  // Campos de validação BPO
  created_by_side?: 'bpo_side' | 'client_side';
  validated?: boolean;
  validated_at?: string;
  validated_by?: string;
}

// Filtros
export interface AccountsReceivableFilters {
  search?: string;
  status?: 'all' | 'open' | 'received' | 'overdue' | 'cancelled';
  payment_method?: string;
  category_id?: string;
  client_id?: string;
}

// Tabs de filtro
export type AccountReceivableStatusTab = 'all' | 'open' | 'received' | 'overdue' | 'cancelled';

// Opções de ocorrência (para ser definido pelo front)
export const OccurrenceOptions = [
  { value: 'unique', label: 'Única' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'installments', label: 'Parcelada' }
] as const;

// Opções de dias da semana
export const DaysOfWeekOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' }
] as const;

// Opções de método de recebimento
export const PaymentMethodOptions = [
  { value: 'pix', label: 'PIX' },
  { value: 'bank_slip', label: 'Boleto' },
  { value: 'bank_transfer', label: 'Transferência' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'check', label: 'Cheque' },
] as const;

// Summary de indicadores (view accounts_receivable_summary)
export interface AccountsReceivableSummary {
  company_id: string;
  total_contas: number;
  contas_vencidas: number;
  contas_vence_breve: number;
  contas_em_dia: number;
  contas_sem_data: number;
  valor_total: number;
  valor_vencido: number;
  valor_vence_breve: number;
  valor_em_dia: number;
  proximo_vencimento?: string;
  valor_medio: number;
  contas_pix: number;
  contas_boleto: number;
  contas_transferencia: number;
  ultima_atualizacao?: string;
}