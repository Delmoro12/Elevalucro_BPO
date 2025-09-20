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
    contact_name: formData.nomeContato,
    contact_cpf: formData.cpfContato,
    contact_email: formData.emailContato,
    contact_phone: formData.telefoneContato || undefined,
    contact_role: formData.cargoContato || undefined,
    
    // Dados da empresa
    company_name: formData.nomeEmpresa,
    cnpj: formData.cnpj,
    address: formData.endereco || undefined,
    number: formData.numero || undefined,
    neighborhood: formData.bairro || undefined,
    zip_code: formData.cep || undefined,
    city: formData.cidade || undefined,
    state: formData.estado || undefined,
    
    // Dados técnicos/operacionais
    segment: formData.segmento || undefined,
    areas: formData.areas.length > 0 ? formData.areas : undefined,
    banks: formData.bancos.length > 0 ? formData.bancos : undefined,
    banks_other: formData.bancosOutro || undefined,
    tools: formData.ferramentas.length > 0 ? formData.ferramentas : undefined,
    tools_other: formData.ferramentasOutro || undefined,
    suppliers: formData.fornecedores.length > 0 ? formData.fornecedores : undefined,
    organization: formData.organizacao.length > 0 ? formData.organizacao : undefined,
    reports: formData.relatorios.length > 0 ? formData.relatorios : undefined,
    
    // Expectativas e objetivos
    success_expectations: formData.expectativasSucesso || undefined,
    
    // Plano selecionado
    plan: planoMap[formData.plano] || 'controle',
    monthly_value: formData.valorMensal,
    
    // Metadados
    source: origem || 'site',
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