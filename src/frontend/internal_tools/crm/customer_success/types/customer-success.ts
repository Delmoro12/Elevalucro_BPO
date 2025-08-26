// Tipos para sucesso do cliente
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
export type HealthStatus = 'healthy' | 'at_risk' | 'critical';

export interface Client {
  id: string;
  nome_empresa: string;
  nome_contato: string;
  email_contato: string;
  telefone_contato?: string;
  plano: 'controle' | 'gerencial' | 'avancado';
  valor_mensal: number;
  data_assinatura: string;
  status: 'ativo' | 'suspenso' | 'cancelado';
  health_status: HealthStatus;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  client_id: string;
  titulo: string;
  descricao: string;
  categoria: 'tecnico' | 'financeiro' | 'treinamento' | 'funcionalidade' | 'outro';
  prioridade: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Dados do cliente (para exibição)
  cliente_nome?: string;
  cliente_email?: string;
  cliente_plano?: string;
}

export interface HealthMetric {
  client_id: string;
  metric_name: string;
  metric_value: number;
  target_value: number;
  measured_at: string;
}

export interface CustomerSuccessFilters {
  health_status?: HealthStatus;
  plano?: 'controle' | 'gerencial' | 'avancado';
  status?: 'ativo' | 'suspenso' | 'cancelado';
  search?: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  prioridade?: TicketPriority;
  categoria?: string;
  assignee?: string;
  search?: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface TicketListResponse {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para atualizações
export interface TicketUpdatePayload {
  titulo?: string;
  descricao?: string;
  categoria?: string;
  prioridade?: TicketPriority;
  status?: TicketStatus;
  assignee?: string;
}

export interface ClientUpdatePayload {
  health_status?: HealthStatus;
  status?: 'ativo' | 'suspenso' | 'cancelado';
}