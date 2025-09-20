import { ComponentType } from 'react';

export interface TabIndicator {
  label: string;
  value: string | number;
  icon?: ComponentType<any>;
  color?: string;
}

export interface FinancialSummary {
  company_id: string;
  total_contas: number;
  contas_pendentes: number;
  contas_vencidas: number;
  contas_vence_breve: number;
  valor_total: number;
  valor_pendente: number;
  valor_vencido: number;
  valor_vence_breve: number;
  valor_em_dia: number;
  contas_pix: number;
  contas_boleto: number;
  contas_transferencia: number;
  contas_validadas: number;
  contas_nao_validadas: number;
  ultima_atualizacao: string;
}

export interface AccountsReceivableSummary extends FinancialSummary {
  contas_recebidas: number;
  valor_recebido: number;
}

export interface AccountsPayableSummary extends FinancialSummary {
  contas_pagas: number;
  valor_pago: number;
}