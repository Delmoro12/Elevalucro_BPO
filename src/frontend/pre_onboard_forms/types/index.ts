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
  bancos_outro?: string;
  ferramentas?: string[];
  ferramentas_outro?: string;
  fornecedores?: string[];
  organizacao?: string[];
  relatorios?: string[];
  
  // Expectativas e objetivos
  expectativas_sucesso?: string;
  
  // Plano selecionado
  plano: 'controle' | 'gerencial' | 'avancado';
  valor_mensal: number;
  
  // Metadados
  origem?: string;
  observacoes?: string;
}

export interface PlanConfig {
  name: string;
  value: number;
  displayName: string;
  enabledAreas: string[];
  subtitle: string;
}