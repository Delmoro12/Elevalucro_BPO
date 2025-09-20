/**
 * Tipos para transações financeiras do app cliente
 */

import { BaseEntityWithUser, TransactionStatus, TransactionType, PaymentMethod, VencimentoStatus } from '../shared'

export interface FinancialTransaction extends BaseEntityWithUser {
  company_id: string
  type: TransactionType
  created_by_side: 'client_side' | 'bpo_side'
  pix_number?: string
  bank_slip_code?: string
  payment_method?: PaymentMethod
  companies_clients_suppliers_id?: string
  due_date: string
  value: number
  date_of_issue?: string
  number_of_document?: string
  notes?: string
  occurrence?: string
  status: TransactionStatus
  payment_date?: string
  paid_amount?: number
  financial_account_id?: string
  parent_account_id?: string
  series_id?: string
  recurrence_config?: Record<string, any>
  installment_number?: number
  installment_total?: number
  validated?: boolean
  validated_at?: string
  validated_by?: string
  validated_by_email?: string
  validated_by_name?: string
  search_text?: string
}

export interface FinancialTransactionView extends FinancialTransaction {
  // Campos computados da view
  third_party_name?: string
  third_party_email?: string
  third_party_document?: string
  third_party_type?: string
  third_party_phone?: string
  third_party_whatsapp?: string
  third_party_pix?: string
  supplier_name?: string
  client_name?: string
  category_name?: string
  category_id?: string
  dre_group_name?: string
  dre_group_order?: number
  status_vencimento?: VencimentoStatus
  dias_vencimento?: number
  value_formatted?: string
  due_date_formatted?: string
  date_of_issue_formatted?: string
  type_label?: string
  third_party_label?: string
}

// Tipo específico para APIs de summary (resolve 80% dos erros)
export interface FinancialTransactionSummary {
  id: string
  status: TransactionStatus
  value: number
  status_vencimento?: VencimentoStatus
  due_date: string
  type: TransactionType
  paid_amount?: number
  payment_date?: string
  payment_method?: PaymentMethod
  validated?: boolean
}

// Tipos para requests/responses
export interface CreateFinancialTransactionRequest {
  company_id: string
  type: TransactionType
  due_date: string
  value: number
  payment_method?: PaymentMethod
  number_of_document?: string
  notes?: string
  companies_clients_suppliers_id?: string
  financial_account_id?: string
  date_of_issue?: string
}

export interface UpdateFinancialTransactionRequest {
  id: string
  data: Partial<Omit<CreateFinancialTransactionRequest, 'company_id'>>
}

export interface FinancialSummaryResponse {
  // Contadores
  totalContas: number
  contasPendentes: number
  contasPagas: number
  contasVencidas: number
  contasVenceBreve: number
  
  // Valores
  valorTotal: number
  valorPendente: number
  valorPago: number
  valorVencido: number
  valorVenceBreve: number
  valorEmDia: number
  
  // Próximos vencimentos
  proximosVencimentos: FinancialTransactionSummary[]
  contasVencidasLista: FinancialTransactionSummary[]
  maiorValor: FinancialTransactionSummary[]
}

export interface PaymentProcessRequest {
  id: string
  paid_amount: number
  payment_date: string
  payment_method?: PaymentMethod
  financial_account_id?: string
  notes?: string
}