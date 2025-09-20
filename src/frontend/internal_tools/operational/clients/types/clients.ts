// Tipos para gestão operacional de clientes
export type ClientStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado' | 'pendente';
export type ClientPlan = 'controle' | 'gerencial' | 'avancado';

export interface OperationalClient {
  id: string;
  company_id: string;
  nome_empresa: string;
  nome_contato: string;
  email_contato: string;
  telefone_contato?: string;
  cpf_contato?: string;
  cnpj?: string;
  plano: ClientPlan;
  valor_mensal: number;
  status: ClientStatus;
  data_inicio: string;
  data_cancelamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Dados operacionais
  responsavel_operacional?: string;
  ultimo_contato?: string;
  proxima_acao?: string;
  tags?: string[];
  
  // Dados adicionais da company
  endereco_completo?: string;
  segmento?: string;
  progresso_onboarding?: number;
  lifecycle_stage?: string;
  analista_bpo?: string;
  whatsapp_contato?: string;
  website?: string;
}

export interface ClientFilters {
  status?: ClientStatus;
  plano?: ClientPlan;
  responsavel_operacional?: string;
  search?: string;
  data_inicio_from?: string;
  data_inicio_to?: string;
}

export interface ClientListResponse {
  data: OperationalClient[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientUpdatePayload {
  nome_empresa?: string;
  nome_contato?: string;
  email_contato?: string;
  telefone_contato?: string;
  status?: ClientStatus;
  responsavel_operacional?: string;
  observacoes?: string;
  proxima_acao?: string;
  tags?: string[];
}