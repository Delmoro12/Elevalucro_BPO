import { FormData, ProspectData } from '../types';

/**
 * Converte dados do formulário para formato da API
 */
export function convertFormDataToProspect(formData: FormData, origem?: string): ProspectData {
  // Mapear plano name para slug
  const planoMap: Record<string, 'controle' | 'gerencial' | 'avancado'> = {
    'CONTROLE': 'controle',
    'GERENCIAL': 'gerencial',
    'AVANÇADO': 'avancado'
  };

  return {
    // Dados pessoais do contato
    nome_contato: formData.nomeContato,
    cpf_contato: formData.cpfContato,
    email_contato: formData.emailContato,
    telefone_contato: formData.telefoneContato || undefined,
    cargo_contato: formData.cargoContato || undefined,
    
    // Dados da empresa
    nome_empresa: formData.nomeEmpresa,
    cnpj: formData.cnpj,
    endereco: formData.endereco || undefined,
    numero: formData.numero || undefined,
    bairro: formData.bairro || undefined,
    cep: formData.cep || undefined,
    cidade: formData.cidade || undefined,
    estado: formData.estado || undefined,
    
    // Dados técnicos/operacionais
    segmento: formData.segmento || undefined,
    areas: formData.areas.length > 0 ? formData.areas : undefined,
    bancos: formData.bancos.length > 0 ? formData.bancos : undefined,
    bancos_outro: formData.bancosOutro || undefined,
    ferramentas: formData.ferramentas.length > 0 ? formData.ferramentas : undefined,
    ferramentas_outro: formData.ferramentasOutro || undefined,
    fornecedores: formData.fornecedores.length > 0 ? formData.fornecedores : undefined,
    organizacao: formData.organizacao.length > 0 ? formData.organizacao : undefined,
    relatorios: formData.relatorios.length > 0 ? formData.relatorios : undefined,
    
    // Expectativas e objetivos
    expectativas_sucesso: formData.expectativasSucesso || undefined,
    
    // Plano selecionado
    plano: planoMap[formData.plano] || 'controle',
    valor_mensal: formData.valorMensal,
    
    // Metadados
    origem: origem || 'site',
    observacoes: undefined
  };
}

/**
 * Salva um novo prospect via API route
 */
export async function createProspect(prospectData: ProspectData) {
  try {
    const response = await fetch('/api/prospects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prospectData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro na API:', result);
      throw new Error(result.error || `Erro HTTP: ${response.status}`);
    }

    return result; // { success: true, data: {...} }
  } catch (error) {
    console.error('Erro ao criar prospect:', error);
    
    // Tratamento de erros de rede
    if (error instanceof Error && error.message.includes('fetch')) {
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet e tente novamente.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}