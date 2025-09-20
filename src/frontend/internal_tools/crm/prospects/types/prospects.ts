// Tipos para prospects na listagem
export type ProspectStatus = 'pending' | 'contacted' | 'contract_sent' | 'signed' | 'rejected';

export interface ProspectListItem {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_role?: string;
  company_name: string;
  cnpj: string;
  segment?: string;
  plan: 'controle' | 'gerencial' | 'avancado';
  monthly_value: number;
  status: ProspectStatus;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface ProspectFilters {
  plan?: 'controle' | 'gerencial' | 'avancado';
  source?: string;
  segment?: string;
  search?: string;
}

export interface ProspectListResponse {
  data: ProspectListItem[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para edição de prospect
export interface ProspectEditData {
  id: string;
  // Dados pessoais do contato
  contact_name: string;
  contact_cpf: string;
  contact_email: string;
  contact_phone?: string;
  contact_role?: string;
  
  // Dados da empresa
  company_name: string;
  cnpj: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  zip_code?: string;
  city?: string;
  state?: string;
  
  // Dados técnicos/operacionais
  segment?: string;
  areas?: string[];
  banks?: string[];
  tools?: string[];
  suppliers?: string[];
  organization?: string[];
  reports?: string[];
  
  // Expectativas e objetivos
  success_expectations?: string;
  
  // Plano selecionado
  plan: 'controle' | 'gerencial' | 'avancado';
  monthly_value: number;
  
  // Status e metadados
  status: ProspectStatus;
  source?: string;
  notes?: string;
}

export interface ProspectUpdatePayload {
  contact_name?: string;
  contact_cpf?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_role?: string;
  company_name?: string;
  cnpj?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  zip_code?: string;
  city?: string;
  state?: string;
  segment?: string;
  areas?: string[];
  banks?: string[];
  tools?: string[];
  suppliers?: string[];
  organization?: string[];
  reports?: string[];
  success_expectations?: string;
  plan?: 'controle' | 'gerencial' | 'avancado';
  monthly_value?: number;
  status?: ProspectStatus;
  origem?: string;
  observacoes?: string;
  // Aliases para compatibilidade
  source?: string;
  notes?: string;
  bancos?: string[];
  ferramentas?: string[];
  organizacao?: string[];
}