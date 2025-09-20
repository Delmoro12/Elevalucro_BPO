import { ComponentType } from 'react';

export interface TabIndicator {
  label: string;
  value: string | number;
  icon?: ComponentType<any>;
  color?: string;
}

export interface CashMovementsFilters {
  selectedAccountId: string;
  dateFilter: any; // DataTable02DateFilter type
  activeTab: 'all' | 'credits' | 'debits';
}

export interface CashMovementsIndicators {
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  accountsCount: number;
  selectedAccountBalance?: number;
  selectedAccountName?: string;
  lastMovementDate?: string;
}