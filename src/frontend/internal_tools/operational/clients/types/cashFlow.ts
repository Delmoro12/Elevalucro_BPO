// ======================================
// Types: Cash Flow
// ======================================
// Tipos para fluxo de caixa nas Tools

export interface CashFlowTransaction {
  id: string;
  company_id: string;
  type: 'receivable' | 'payable';
  created_by_side: 'bpo_side' | 'client_side';
  
  // Classificação para fluxo de caixa
  cash_flow_type: 'CRÉDITO' | 'DÉBITO';
  
  // Informações básicas
  due_date: string;
  date_of_issue: string | null;
  value: number;
  payment_date: string | null;
  paid_amount: number | null;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method: string;
  
  // Documentação
  number_of_document: string | null;
  observacao: string | null;
  
  // Terceiros (fornecedor/cliente)
  third_party_name: string;
  fornecedor_nome: string | null;
  cliente_nome: string | null;
  third_party_document: string;
  third_party_type: 'cliente' | 'fornecedor' | null;
  
  // Categoria e grupos
  category_name: string;
  category_id: string | null;
  dre_group_name: string;
  dre_group_order: number | null;
  
  // Conta financeira
  financial_account_name: string;
  financial_account_id: string | null;
  
  // Campos específicos
  fag: boolean | null;
  is_forecast: boolean | null;
  
  // Status calculado
  cash_flow_status: 'REALIZADO' | 'SEM_DATA' | 'VENCIDO' | 'VENCE_EM_BREVE' | 'A_VENCER';
  days_to_due: number | null;
  
  // Valores calculados
  cash_flow_value: number;
  realized_value: number;
  pending_value: number;
  
  // Validação BPO
  validated: boolean;
  validated_at: string | null;
  validated_by: string | null;
  validated_by_name: string;
  
  // Formatação frontend
  value_formatted: string;
  due_date_formatted: string;
  payment_date_formatted: string | null;
  
  // Auditoria
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface CashFlowIndicators {
  company_id: string;
  
  // Indicadores principais (4 escolhidos)
  realized_balance: number;      // Saldo Realizado
  liquidity_ratio: number;       // Índice de Liquidez
  pending_income: number;        // Receitas Pendentes
  pending_expenses: number;      // Despesas Pendentes
  
  // Timestamp
  calculated_at: string;
}

export interface CashFlowFilters {
  // Filtros de período
  startDate?: string;
  endDate?: string;
  period?: 'month' | 'quarter' | 'year' | 'custom';
  
  // Filtros de status
  status?: 'all' | 'realized' | 'pending' | 'overdue';
  
  // Filtros de tipo
  type?: 'all' | 'credit' | 'debit';
  
  // Filtro por conta financeira
  financial_account_id?: string;
  
  // Filtro por categoria
  category_id?: string;
  
  // Busca textual
  search?: string;
}

export interface CashFlowApiResponse {
  success: boolean;
  data: CashFlowTransaction[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface CashFlowIndicatorsApiResponse {
  success: boolean;
  data: CashFlowIndicators;
  error?: string;
}