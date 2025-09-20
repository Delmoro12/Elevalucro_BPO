// Types para as configurações financeiras (read-only)

// Financial Category
export interface FinancialCategory {
  id: string;
  company_id: string;
  description: string;
  dre_groups_id?: string;
  dre_group_name?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

// DRE Groups
export interface DREGroup {
  id: string;
  company_id: string;
  description: string;
  sort_order: number;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

// Financial Account
export interface FinancialAccount {
  id: string;
  company_id: string;
  description: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

// Filters
export interface ConfigFilters {
  search?: string;
  type?: 'category' | 'group' | 'account';
}

// Tab types
export type ConfigTabType = 'categories' | 'groups' | 'accounts';