export interface PlanConfig {
  name: string;
  value: number;
  displayName: string;
  enabledAreas: string[];
  subtitle: string;
}

export const planConfigs: Record<string, PlanConfig> = {
  controle: {
    name: "CONTROLE",
    value: 1200,
    displayName: "Controle", 
    enabledAreas: [
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber", 
      "conciliacao_bancaria",
      "organizacao_documentos"
    ],
    subtitle: "Áreas para BPO - Plano Controle"
  },
  
  gerencial: {
    name: "GERENCIAL",
    value: 1500,
    displayName: "Gerencial",
    enabledAreas: [
      // Todas do Controle
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber", 
      "conciliacao_bancaria",
      "organizacao_documentos",
      // Específicas do Gerencial
      "cobranca_inadimplentes",
      "emissao_boletos",
      "relatorio_fluxo_caixa",
      "relatorios_entradas_saidas",
      "caixa_diario",
      "dre_indicadores"
    ],
    subtitle: "Áreas para BPO - Plano Gerencial"
  },
  
  avancado: {
    name: "AVANÇADO", 
    value: 1900,
    displayName: "Avançado",
    enabledAreas: [
      // Todas do Gerencial
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber", 
      "conciliacao_bancaria",
      "organizacao_documentos",
      "cobranca_inadimplentes",
      "emissao_boletos",
      "relatorio_fluxo_caixa",
      "relatorios_entradas_saidas",
      "caixa_diario",
      "dre_indicadores",
      // Específicas do Avançado
      "analise_dre_consultor",
      "analise_margens_consultor",
      "analise_fluxo_consultor",
      "acoes_estrategicas"
    ],
    subtitle: "Áreas para BPO - Plano Avançado"
  }
};