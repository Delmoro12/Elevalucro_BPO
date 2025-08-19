// Mapeamento das variáveis do contrato com dados do formulário

export interface ContratoVariables {
  // Dados da Empresa
  nome_empresa: string
  cnpj: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  segmento: string
  
  // Dados do Contato
  nome_contato: string
  cargo_contato: string
  email_contato: string
  telefone_contato: string
  cpf_responsavel?: string
  
  // Dados do Plano
  tipo_plano: 'CONTROLE' | 'GERENCIAL' | 'AVANÇADO'
  valor_mensal: string
  valor_por_extenso: string
  servicos_inclusos: string
  
  // Áreas e Sistemas
  areas_bpo: string
  bancos_utilizados: string
  ferramentas_utilizadas: string
  
  // Datas
  data_inicio: string
  data_assinatura: string
  data_geracao: string
  dia_vencimento: string
  cidade_contratante: string
}

export function mapFormDataToContract(formData: any, planType: 'controle' | 'gerencial' | 'avancado'): ContratoVariables {
  // Configurações dos planos
  const planos = {
    controle: {
      valor: '950,00',
      valor_extenso: 'novecentos e cinquenta reais',
      tipo: 'CONTROLE',
      servicos: `• Elaboração/revisão de categorias (despesas, receitas) e centros de custos
• Elaboração/revisão do budget anual de despesas fixas
• Lançamento e pagamentos de Contas a Pagar
• Lançamento e recebimentos de Contas a Receber
• Conciliação bancária (cartão, PIX, boletos)
• Organização e envio de documentos fiscais para contabilidade`
    },
    gerencial: {
      valor: '1.300,00',
      valor_extenso: 'mil e trezentos reais',
      tipo: 'GERENCIAL',
      servicos: `• Todos os serviços do Plano Controle
• Cobrança de inadimplentes (contato ativo com clientes em atraso)
• Emissão de NF (quando aplicável)
• Relatório de fluxo de caixa
• Relatórios de entradas e saídas
• Caixa diário
• DRE e indicadores de receitas e despesas por categoria`
    },
    avancado: {
      valor: '1.700,00',
      valor_extenso: 'mil e setecentos reais',
      tipo: 'AVANÇADO',
      servicos: `• Todos os serviços do Plano Gerencial
• Análise mensal do DRE e indicadores com consultor
• Análise mensal de margens e lucratividade com consultor
• Análise mensal do fluxo de caixa com consultor
• Suporte para definição das ações estratégicas relacionadas às análises`
    }
  }

  const planoSelecionado = planos[planType]
  
  // Gerar datas
  const hoje = new Date()
  const proximoMes = new Date(hoje)
  proximoMes.setMonth(proximoMes.getMonth() + 1)
  proximoMes.setDate(1) // Início do próximo mês

  return {
    // Dados da Empresa
    nome_empresa: formData.nomeEmpresa,
    cnpj: formData.cnpj,
    endereco: formData.endereco,
    numero: formData.numero,
    bairro: formData.bairro,
    cidade: formData.cidade,
    estado: formData.estado,
    cep: formData.cep,
    segmento: formData.segmento,
    
    // Dados do Contato
    nome_contato: formData.nomeContato,
    cargo_contato: formData.cargoContato,
    email_contato: formData.emailContato,
    telefone_contato: formData.telefoneContato,
    
    // Dados do Plano
    tipo_plano: planoSelecionado.tipo as 'CONTROLE' | 'GERENCIAL' | 'AVANÇADO',
    valor_mensal: planoSelecionado.valor,
    valor_por_extenso: planoSelecionado.valor_extenso,
    servicos_inclusos: planoSelecionado.servicos,
    
    // Áreas e Sistemas (formatados como listas)
    areas_bpo: formData.areas.map((area: string) => `• ${area}`).join('\n'),
    bancos_utilizados: formData.bancos.map((banco: string) => `• ${banco}`).join('\n'),
    ferramentas_utilizadas: formData.ferramentas.map((ferramenta: string) => `• ${ferramenta}`).join('\n'),
    
    // Datas
    data_inicio: proximoMes.toLocaleDateString('pt-BR'),
    data_assinatura: hoje.toLocaleDateString('pt-BR'),
    data_geracao: hoje.toLocaleString('pt-BR'),
    dia_vencimento: '5',
    cidade_contratante: formData.cidade
  }
}

// Exemplo de uso
export function generateContractHTML(formData: any, planType: 'controle' | 'gerencial' | 'avancado'): string {
  const variables = mapFormDataToContract(formData, planType)
  
  // Aqui você pegaria o template HTML e substituiria as variáveis
  // Por exemplo: template.replace(/{{nome_empresa}}/g, variables.nome_empresa)
  
  return `Template HTML com variáveis substituídas`
}

// Para usar com D4Sign quando a API estiver disponível
export function prepareD4SignPayload(formData: any, planType: 'controle' | 'gerencial' | 'avancado', templateId: string) {
  const variables = mapFormDataToContract(formData, planType)
  
  return {
    templates: {
      [templateId]: {
        contratante: {
          nome_empresa: variables.nome_empresa,
          cnpj: variables.cnpj,
          endereco_completo: `${variables.endereco}, ${variables.numero}`,
          bairro: variables.bairro,
          cidade: variables.cidade,
          estado: variables.estado,
          cep: variables.cep,
          segmento: variables.segmento,
          nome_contato: variables.nome_contato,
          cargo_contato: variables.cargo_contato,
          email_contato: variables.email_contato,
          telefone_contato: variables.telefone_contato
        },
        plano: {
          tipo_plano: variables.tipo_plano,
          valor_mensal: variables.valor_mensal,
          valor_por_extenso: variables.valor_por_extenso,
          servicos_inclusos: variables.servicos_inclusos
        },
        servicos: {
          areas_bpo: variables.areas_bpo,
          bancos_utilizados: variables.bancos_utilizados,
          ferramentas_utilizadas: variables.ferramentas_utilizadas
        },
        tokens_gerais: {
          data_inicio: variables.data_inicio,
          data_assinatura: variables.data_assinatura,
          data_geracao: variables.data_geracao,
          dia_vencimento: variables.dia_vencimento,
          cidade_contratante: variables.cidade_contratante
        }
      }
    }
  }
}