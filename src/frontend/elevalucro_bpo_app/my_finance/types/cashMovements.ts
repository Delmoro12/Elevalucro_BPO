// ======================================
// Types: Cash Movements
// ======================================

export interface CashMovement {
  id: string;
  company_id: string;
  financial_account_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference_type?: string;
  reference_id?: string;
  date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  
  // Campos da view (se existir)
  financial_account_name?: string;
  financial_account_type?: string;
  
  // Campos formatados para exibição
  amount_formatted?: string;
  date_formatted?: string;
  
  // Campos de auditoria expandidos
  created_by_email?: string;
  updated_by_email?: string;
}

export interface CashMovementFormData {
  financial_account_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference_type?: string;
  reference_id?: string;
  date: string;
}

export interface CreateCashMovementRequest extends CashMovementFormData {
  company_id: string;
}

export interface UpdateCashMovementRequest extends Partial<CashMovementFormData> {
  id: string;
}

export interface CashMovementApiResponse {
  success: boolean;
  data?: CashMovement | CashMovement[];
  total?: number;
  error?: string;
  message?: string;
}

export interface AccountBalance {
  account_id: string;
  account_name: string;
  balance: number;
  balance_formatted: string;
}

export interface AccountBalanceApiResponse {
  success: boolean;
  data?: AccountBalance;
  error?: string;
}

// Tab types para filtros
export type CashMovementStatusTab = 'all' | 'credits' | 'debits';

// Filter types
export interface CashMovementFilters {
  financial_account_id?: string;
  type?: 'credit' | 'debit';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  date_filter?: {
    type: 'month' | 'specific' | 'range';
    month?: string;
    specificDate?: string;
    startDate?: string;
    endDate?: string;
  };
}

// Hook types
export interface UseCashMovementsResult {
  cashMovements: CashMovement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createMovement: (data: CreateCashMovementRequest) => Promise<CashMovement>;
  updateMovement: (data: UpdateCashMovementRequest) => Promise<CashMovement>;
  deleteMovement: (id: string) => Promise<void>;
  getAccountBalance: (accountId: string) => Promise<AccountBalance>;
}

// Summary/Statistics interfaces
export interface CashMovementsSummary {
  company_id: string;
  total_movements: number;
  total_credits: number;
  total_debits: number;
  credits_count: number;
  debits_count: number;
  period_start?: string;
  period_end?: string;
  last_movement_date?: string;
}

export interface CashMovementsSummaryApiResponse {
  success: boolean;
  data?: CashMovementsSummary;
  error?: string;
}

export interface UseCashMovementsSummaryResult {
  summary: CashMovementsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Financial Account interface (para dropdowns)
export interface FinancialAccount {
  id: string;
  name: string;
  type: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialAccountsApiResponse {
  success: boolean;
  data?: FinancialAccount[];
  error?: string;
}