// Tipos dos documentos baseados na estrutura do banco de dados
import { convertBrazilianDateToISO } from '../../shared/utils';

export type DocumentType = 'fiscal' | 'nao_fiscal';
export type DocumentCategory = 'entrada' | 'saida';
export type DocumentStatus = 'pendente' | 'processado' | 'conciliado' | 'erro';

// Interface principal do documento - alinhada com a tabela do banco
export interface Document {
  id: string;
  company_id: string;
  
  // Dados basicos do documento
  nome: string;
  arquivo: string;
  tipo_documento: DocumentType;
  categoria: DocumentCategory;
  
  // Dados financeiros extraidos pela IA
  valor?: string; // Valor formatado (ex: "R$ 1.234,56")
  valor_decimal?: number; // Valor numerico para calculos
  data_documento?: string; // Data do documento (extraida do conteudo)
  
  // Dados das partes envolvidas (extraidos pela IA)
  fornecedor?: string;
  cliente?: string;
  cnpj?: string;
  
  // Dados especificos do documento (extraidos pela IA)
  descricao?: string;
  
  // Dados complementares (preenchidos pelo usuario)
  forma_pagamento?: string;
  centro_custo?: string;
  
  // Metadados do arquivo
  tamanho?: string; // Tamanho formatado (ex: "2.5 MB")
  tamanho_bytes?: number; // Tamanho em bytes para calculos
  data_upload: string; // ISO string
  
  // Status de processamento
  status: DocumentStatus;
  
  // Dados do processamento pela IA
  confianca_ia?: number; // Nivel de confianca da IA (0-100)
  dados_completos?: boolean; // Se todos os campos obrigatorios estao preenchidos
  processamento_ia?: Record<string, any>; // Dados completos extraidos pela IA
  
  // Dados especificos para planilhas Excel
  linhas_processadas?: number;
  linhas_total?: number;
  erros_excel?: string[];
  
  // Classificacao e organizacao
  tags?: string[];
  observacoes?: string;
  
  // Auditoria
  created_by?: string;
  updated_by?: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

// Interface para criacao de documentos (sem campos auto-gerados)
export interface CreateDocumentRequest {
  // Dados basicos (obrigatorios)
  nome: string;
  arquivo: string; // Caminho/URL do arquivo
  tipo_documento: DocumentType;
  categoria: DocumentCategory;
  
  // Dados extraidos pela IA
  valor?: string;
  valor_decimal?: number;
  data_documento?: string;
  fornecedor?: string;
  cliente?: string;
  cnpj?: string;
  descricao?: string;
  
  // Dados do usuario
  forma_pagamento?: string;
  centro_custo?: string;
  
  // Metadados
  tamanho?: string;
  tamanho_bytes?: number;
  
  // IA processing data
  confianca_ia?: number;
  dados_completos?: boolean;
  processamento_ia?: Record<string, any>;
  
  // Excel specific
  linhas_processadas?: number;
  linhas_total?: number;
  erros_excel?: string[];
  
  // Organizacao
  tags?: string[];
  observacoes?: string;
}

// Interface para atualizacao de documentos
export interface UpdateDocumentRequest extends Partial<CreateDocumentRequest> {
  id: string;
}

// Interface para os dados extraidos pela IA (do claudeService)
export interface DocumentData {
  tipo: DocumentType;
  valor?: string;
  data?: string;
  fornecedor?: string;
  cliente?: string;
  cnpj?: string;
  formaPagamento?: string;
  descricao?: string;
  dadosCompletos: boolean;
  confianca: number; // 0-100%
}

// Interface para arquivos Excel
export interface ExcelFile {
  id: string;
  nome: string;
  status: 'processando' | 'processado' | 'erro' | 'aguardando_validacao';
  dataUpload: string;
  tamanho: string;
  linhasProcessadas?: number;
  linhasTotal?: number;
  erros?: string[];
}

// Interface para mensagens do chat
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  message: string;
  timestamp: Date;
}

// Interface para informacoes do documento durante upload
export interface DocumentInfo {
  file: File | null;
  categoria: DocumentCategory | '';
  tipoFiscal: 'fiscal' | 'nao_fiscal' | '';
  descricao: string;
}

// Funcao utilitaria para converter DocumentData para CreateDocumentRequest
export function documentDataToCreateRequest(
  documentData: DocumentData,
  documentInfo: DocumentInfo,
  fileName: string,
  fileSize: number
): CreateDocumentRequest {
  return {
    nome: fileName,
    arquivo: fileName, // Sera atualizado com o caminho correto apos upload
    tipo_documento: documentInfo.tipoFiscal as DocumentType, // Usar escolha do usuário ao invés da IA
    categoria: documentInfo.categoria as DocumentCategory,
    
    // Dados da IA - com conversao de data
    valor: documentData.valor,
    data_documento: convertBrazilianDateToISO(documentData.data || ''),
    fornecedor: documentData.fornecedor,
    cliente: documentData.cliente,
    cnpj: documentData.cnpj,
    descricao: documentData.descricao,
    
    // Dados do usuario
    forma_pagamento: documentData.formaPagamento,
    
    // Metadados
    tamanho: formatFileSize(fileSize),
    tamanho_bytes: fileSize,
    
    // IA processing
    confianca_ia: documentData.confianca,
    dados_completos: documentData.dadosCompletos,
    processamento_ia: documentData as any
  };
}

// Funcao utilitaria para formatar tamanho do arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

