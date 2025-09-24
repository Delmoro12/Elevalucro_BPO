export interface FluxoCaixaEntry {
  id: string;
  data: string;
  descricao: string;
  categoria: 'receita' | 'despesa';
  tipo: string;
  valor: number;
  saldo: number;
  status: 'realizado' | 'previsto';
}

export interface DREItem {
  id: string;
  categoria: string;
  subcategoria?: string;
  valor_atual: number;
  valor_anterior: number;
  variacao_percentual: number;
  nivel: number;
}

export interface BalancoItem {
  id: string;
  categoria: string;
  subcategoria?: string;
  valor_atual: number;
  valor_anterior: number;
  tipo: 'ativo' | 'passivo' | 'patrimonio';
  nivel: number;
}

export interface KPICard {
  titulo: string;
  valor: string | number;
  variacao?: number;
  tipo: 'currency' | 'percentage' | 'number';
  icone?: string;
  cor?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DashboardPeriod {
  inicio: Date;
  fim: Date;
  periodo: 'mensal' | 'trimestral' | 'anual' | 'customizado';
}