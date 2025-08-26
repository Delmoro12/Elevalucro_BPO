// Tipos para prospects na listagem
export type ProspectStatus = 'pending' | 'contacted' | 'contract_sent' | 'signed' | 'rejected';

export interface ProspectListItem {
  id: string;
  nome_contato: string;
  email_contato: string;
  telefone_contato?: string;
  cargo_contato?: string;
  nome_empresa: string;
  cnpj: string;
  segmento?: string;
  plano: 'controle' | 'gerencial' | 'avancado';
  valor_mensal: number;
  status: ProspectStatus;
  origem?: string;
  created_at: string;
  updated_at: string;
}

export interface ProspectFilters {
  plano?: 'controle' | 'gerencial' | 'avancado';
  origem?: string;
  segmento?: string;
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
  nome_contato: string;
  cpf_contato: string;
  email_contato: string;
  telefone_contato?: string;
  cargo_contato?: string;
  
  // Dados da empresa
  nome_empresa: string;
  cnpj: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  
  // Dados técnicos/operacionais
  segmento?: string;
  areas?: string[];
  bancos?: string[];
  ferramentas?: string[];
  fornecedores?: string[];
  organizacao?: string[];
  relatorios?: string[];
  
  // Expectativas e objetivos
  expectativas_sucesso?: string;
  
  // Plano selecionado
  plano: 'controle' | 'gerencial' | 'avancado';
  valor_mensal: number;
  
  // Status e metadados
  status: ProspectStatus;
  origem?: string;
  observacoes?: string;
}

export interface ProspectUpdatePayload {
  nome_contato?: string;
  cpf_contato?: string;
  email_contato?: string;
  telefone_contato?: string;
  cargo_contato?: string;
  nome_empresa?: string;
  cnpj?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  segmento?: string;
  areas?: string[];
  bancos?: string[];
  ferramentas?: string[];
  fornecedores?: string[];
  organizacao?: string[];
  relatorios?: string[];
  expectativas_sucesso?: string;
  plano?: 'controle' | 'gerencial' | 'avancado';
  valor_mensal?: number;
  status?: ProspectStatus;
  origem?: string;
  observacoes?: string;
}