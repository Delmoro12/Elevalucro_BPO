// Tipos para leads na listagem
export type LeadKanbanStage = 'new' | 'contacted' | 'qualified' | 'scheduled' | 'lost';

// Tipo para usuários do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LeadListItem {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_role?: string;
  company_name: string;
  cnpj?: string;
  segment?: string;
  plan?: 'controle' | 'gerencial' | 'avancado';
  monthly_value?: number;
  kanban_stage: LeadKanbanStage;
  assigned_salesperson_id?: string;
  temperature: 'cold' | 'warm' | 'hot';
  additional_contact_email?: string;
  additional_contact_phone?: string;
  lead_source?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  plan?: 'controle' | 'gerencial' | 'avancado';
  lead_source?: string;
  segment?: string;
  temperature?: 'cold' | 'warm' | 'hot';
  assigned_salesperson_id?: string;
  search?: string;
}

export interface LeadListResponse {
  data: LeadListItem[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para edição de lead
export interface LeadEditData {
  id: string;
  // Dados pessoais do contato
  contact_name: string;
  contact_cpf?: string;
  contact_email: string;
  contact_phone?: string;
  contact_role?: string;
  
  // Dados da empresa
  company_name: string;
  cnpj?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  zip_code?: string;
  city?: string;
  state?: string;
  
  // Dados técnicos/operacionais
  segment?: string;
  
  // Plano selecionado
  plan?: 'controle' | 'gerencial' | 'avancado';
  monthly_value?: number;
  
  // Status e metadados específicos de leads
  kanban_stage: LeadKanbanStage;
  assigned_salesperson_id?: string;
  temperature: 'cold' | 'warm' | 'hot';
  additional_contact_email?: string;
  additional_contact_phone?: string;
  lead_source?: string;
  notes?: string;
}

export interface LeadUpdatePayload {
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
  plan?: 'controle' | 'gerencial' | 'avancado';
  monthly_value?: number;
  kanban_stage?: LeadKanbanStage;
  assigned_salesperson_id?: string;
  temperature?: 'cold' | 'warm' | 'hot';
  additional_contact_email?: string;
  additional_contact_phone?: string;
  lead_source?: string;
  notes?: string;
}

export interface LeadCreatePayload {
  // Dados obrigatórios
  contact_name: string;
  contact_email: string;
  company_name: string;
  
  // Dados opcionais
  contact_cpf?: string;
  contact_phone?: string;
  contact_role?: string;
  cnpj?: string;
  plan?: 'controle' | 'gerencial' | 'avancado';
  monthly_value?: number;
  address?: string;
  number?: string;
  neighborhood?: string;
  zip_code?: string;
  city?: string;
  state?: string;
  company_segment?: string;
  temperature?: 'cold' | 'warm' | 'hot';
  assigned_salesperson_id?: string;
  additional_contact_email?: string;
  additional_contact_phone?: string;
  lead_source?: string;
  notes?: string;
}