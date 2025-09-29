// Tipos específicos para os formulários de pré-onboarding

export interface FormData {
  // Dados pessoais e da empresa
  nomeContato: string;
  cpfContato: string;
  emailContato: string;
  telefoneContato: string;
  cargoContato: string;
  nomeEmpresa: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  
  // Dados técnicos
  segmento: string;
  areas: string[];
  bancos: string[];
  bancosOutro: string;
  ferramentas: string[];
  ferramentasOutro: string;
  fornecedores: string[];
  organizacao: string[];
  relatorios: string[];
  
  // Expectativas e objetivos
  expectativasSucesso: string;
  
  // Plano selecionado
  plano: string;
  valorMensal: number;
}

export interface ProspectData {
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
  banks_other?: string;
  tools?: string[];
  tools_other?: string;
  suppliers?: string[];
  organization?: string[];
  reports?: string[];
  
  // Expectativas e objetivos
  success_expectations?: string;
  
  // Plano selecionado
  plan: 'controle' | 'gerencial' | 'avancado';
  monthly_value: number;
  
  // Status e estágio no funil
  status?: 'lead' | 'prospect';
  kanban_stage?: string;
  
  // Metadados
  source?: string;
  notes?: string;
}

export interface PlanConfig {
  name: string;
  value: number;
  displayName: string;
  enabledAreas: string[];
  subtitle: string;
}