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
  // Campos da view
  financial_account_name?: string;
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

export type CashMovementTab = 'all' | 'credits' | 'debits';

export interface CashMovementFilters {
  financial_account_id?: string;
  type?: 'credit' | 'debit';
  dateFrom?: string;
  dateTo?: string;
}