import { FluxoCaixaEntry, DREItem, BalancoItem, KPICard, ChartData } from '../types/dashboard.types';

export const mockFluxoCaixaData: FluxoCaixaEntry[] = [
  {
    id: '1',
    data: '2024-09-01',
    descricao: 'Recebimento Cliente A',
    categoria: 'receita',
    tipo: 'Vendas',
    valor: 15000,
    saldo: 15000,
    status: 'realizado'
  },
  {
    id: '2',
    data: '2024-09-02',
    descricao: 'Pagamento Fornecedor XYZ',
    categoria: 'despesa',
    tipo: 'Fornecedores',
    valor: -5000,
    saldo: 10000,
    status: 'realizado'
  },
  {
    id: '3',
    data: '2024-09-05',
    descricao: 'Folha de Pagamento',
    categoria: 'despesa',
    tipo: 'Pessoal',
    valor: -8000,
    saldo: 2000,
    status: 'realizado'
  },
  {
    id: '4',
    data: '2024-09-08',
    descricao: 'Recebimento Cliente B',
    categoria: 'receita',
    tipo: 'Vendas',
    valor: 12000,
    saldo: 14000,
    status: 'realizado'
  },
  {
    id: '5',
    data: '2024-09-10',
    descricao: 'Aluguel',
    categoria: 'despesa',
    tipo: 'Despesas Fixas',
    valor: -3000,
    saldo: 11000,
    status: 'realizado'
  },
  {
    id: '6',
    data: '2024-09-15',
    descricao: 'Recebimento Cliente C',
    categoria: 'receita',
    tipo: 'Vendas',
    valor: 8000,
    saldo: 19000,
    status: 'previsto'
  },
  {
    id: '7',
    data: '2024-09-20',
    descricao: 'Impostos',
    categoria: 'despesa',
    tipo: 'Tributos',
    valor: -4500,
    saldo: 14500,
    status: 'previsto'
  },
  {
    id: '8',
    data: '2024-09-25',
    descricao: 'Recebimento Cliente D',
    categoria: 'receita',
    tipo: 'Vendas',
    valor: 10000,
    saldo: 24500,
    status: 'previsto'
  }
];

export const mockDREData: DREItem[] = [
  {
    id: '1',
    categoria: 'RECEITA BRUTA',
    valor_atual: 250000,
    valor_anterior: 220000,
    variacao_percentual: 13.6,
    nivel: 0
  },
  {
    id: '2',
    categoria: 'Vendas de Produtos',
    subcategoria: 'RECEITA BRUTA',
    valor_atual: 150000,
    valor_anterior: 140000,
    variacao_percentual: 7.1,
    nivel: 1
  },
  {
    id: '3',
    categoria: 'Prestação de Serviços',
    subcategoria: 'RECEITA BRUTA',
    valor_atual: 100000,
    valor_anterior: 80000,
    variacao_percentual: 25,
    nivel: 1
  },
  {
    id: '4',
    categoria: '(-) DEDUÇÕES',
    valor_atual: -30000,
    valor_anterior: -28000,
    variacao_percentual: 7.1,
    nivel: 0
  },
  {
    id: '5',
    categoria: 'Impostos sobre Vendas',
    subcategoria: '(-) DEDUÇÕES',
    valor_atual: -20000,
    valor_anterior: -19000,
    variacao_percentual: 5.3,
    nivel: 1
  },
  {
    id: '6',
    categoria: 'Devoluções',
    subcategoria: '(-) DEDUÇÕES',
    valor_atual: -10000,
    valor_anterior: -9000,
    variacao_percentual: 11.1,
    nivel: 1
  },
  {
    id: '7',
    categoria: '(=) RECEITA LÍQUIDA',
    valor_atual: 220000,
    valor_anterior: 192000,
    variacao_percentual: 14.6,
    nivel: 0
  },
  {
    id: '8',
    categoria: '(-) CUSTOS',
    valor_atual: -110000,
    valor_anterior: -100000,
    variacao_percentual: 10,
    nivel: 0
  },
  {
    id: '9',
    categoria: '(=) LUCRO BRUTO',
    valor_atual: 110000,
    valor_anterior: 92000,
    variacao_percentual: 19.6,
    nivel: 0
  },
  {
    id: '10',
    categoria: '(-) DESPESAS OPERACIONAIS',
    valor_atual: -60000,
    valor_anterior: -55000,
    variacao_percentual: 9.1,
    nivel: 0
  },
  {
    id: '11',
    categoria: 'Despesas Administrativas',
    subcategoria: '(-) DESPESAS OPERACIONAIS',
    valor_atual: -25000,
    valor_anterior: -23000,
    variacao_percentual: 8.7,
    nivel: 1
  },
  {
    id: '12',
    categoria: 'Despesas Comerciais',
    subcategoria: '(-) DESPESAS OPERACIONAIS',
    valor_atual: -20000,
    valor_anterior: -18000,
    variacao_percentual: 11.1,
    nivel: 1
  },
  {
    id: '13',
    categoria: 'Despesas Financeiras',
    subcategoria: '(-) DESPESAS OPERACIONAIS',
    valor_atual: -15000,
    valor_anterior: -14000,
    variacao_percentual: 7.1,
    nivel: 1
  },
  {
    id: '14',
    categoria: '(=) LUCRO OPERACIONAL',
    valor_atual: 50000,
    valor_anterior: 37000,
    variacao_percentual: 35.1,
    nivel: 0
  },
  {
    id: '15',
    categoria: '(=) LUCRO LÍQUIDO',
    valor_atual: 50000,
    valor_anterior: 37000,
    variacao_percentual: 35.1,
    nivel: 0
  }
];

export const mockBalancoData: BalancoItem[] = [
  {
    id: '1',
    categoria: 'ATIVO',
    valor_atual: 500000,
    valor_anterior: 450000,
    tipo: 'ativo',
    nivel: 0
  },
  {
    id: '2',
    categoria: 'ATIVO CIRCULANTE',
    subcategoria: 'ATIVO',
    valor_atual: 200000,
    valor_anterior: 180000,
    tipo: 'ativo',
    nivel: 1
  },
  {
    id: '3',
    categoria: 'Caixa e Equivalentes',
    subcategoria: 'ATIVO CIRCULANTE',
    valor_atual: 50000,
    valor_anterior: 45000,
    tipo: 'ativo',
    nivel: 2
  },
  {
    id: '4',
    categoria: 'Contas a Receber',
    subcategoria: 'ATIVO CIRCULANTE',
    valor_atual: 80000,
    valor_anterior: 70000,
    tipo: 'ativo',
    nivel: 2
  },
  {
    id: '5',
    categoria: 'Estoques',
    subcategoria: 'ATIVO CIRCULANTE',
    valor_atual: 70000,
    valor_anterior: 65000,
    tipo: 'ativo',
    nivel: 2
  },
  {
    id: '6',
    categoria: 'ATIVO NÃO CIRCULANTE',
    subcategoria: 'ATIVO',
    valor_atual: 300000,
    valor_anterior: 270000,
    tipo: 'ativo',
    nivel: 1
  },
  {
    id: '7',
    categoria: 'Imobilizado',
    subcategoria: 'ATIVO NÃO CIRCULANTE',
    valor_atual: 250000,
    valor_anterior: 230000,
    tipo: 'ativo',
    nivel: 2
  },
  {
    id: '8',
    categoria: 'Intangível',
    subcategoria: 'ATIVO NÃO CIRCULANTE',
    valor_atual: 50000,
    valor_anterior: 40000,
    tipo: 'ativo',
    nivel: 2
  },
  {
    id: '9',
    categoria: 'PASSIVO',
    valor_atual: 500000,
    valor_anterior: 450000,
    tipo: 'passivo',
    nivel: 0
  },
  {
    id: '10',
    categoria: 'PASSIVO CIRCULANTE',
    subcategoria: 'PASSIVO',
    valor_atual: 150000,
    valor_anterior: 140000,
    tipo: 'passivo',
    nivel: 1
  },
  {
    id: '11',
    categoria: 'Fornecedores',
    subcategoria: 'PASSIVO CIRCULANTE',
    valor_atual: 60000,
    valor_anterior: 55000,
    tipo: 'passivo',
    nivel: 2
  },
  {
    id: '12',
    categoria: 'Empréstimos CP',
    subcategoria: 'PASSIVO CIRCULANTE',
    valor_atual: 40000,
    valor_anterior: 38000,
    tipo: 'passivo',
    nivel: 2
  },
  {
    id: '13',
    categoria: 'Obrigações Trabalhistas',
    subcategoria: 'PASSIVO CIRCULANTE',
    valor_atual: 30000,
    valor_anterior: 28000,
    tipo: 'passivo',
    nivel: 2
  },
  {
    id: '14',
    categoria: 'Obrigações Tributárias',
    subcategoria: 'PASSIVO CIRCULANTE',
    valor_atual: 20000,
    valor_anterior: 19000,
    tipo: 'passivo',
    nivel: 2
  },
  {
    id: '15',
    categoria: 'PASSIVO NÃO CIRCULANTE',
    subcategoria: 'PASSIVO',
    valor_atual: 100000,
    valor_anterior: 90000,
    tipo: 'passivo',
    nivel: 1
  },
  {
    id: '16',
    categoria: 'Empréstimos LP',
    subcategoria: 'PASSIVO NÃO CIRCULANTE',
    valor_atual: 100000,
    valor_anterior: 90000,
    tipo: 'passivo',
    nivel: 2
  },
  {
    id: '17',
    categoria: 'PATRIMÔNIO LÍQUIDO',
    subcategoria: 'PASSIVO',
    valor_atual: 250000,
    valor_anterior: 220000,
    tipo: 'patrimonio',
    nivel: 1
  },
  {
    id: '18',
    categoria: 'Capital Social',
    subcategoria: 'PATRIMÔNIO LÍQUIDO',
    valor_atual: 150000,
    valor_anterior: 150000,
    tipo: 'patrimonio',
    nivel: 2
  },
  {
    id: '19',
    categoria: 'Reservas de Lucros',
    subcategoria: 'PATRIMÔNIO LÍQUIDO',
    valor_atual: 100000,
    valor_anterior: 70000,
    tipo: 'patrimonio',
    nivel: 2
  }
];

export const mockKPICards: KPICard[] = [
  {
    titulo: 'Receita Total',
    valor: 250000,
    variacao: 13.6,
    tipo: 'currency',
    cor: 'green'
  },
  {
    titulo: 'Lucro Líquido',
    valor: 50000,
    variacao: 35.1,
    tipo: 'currency',
    cor: 'green'
  },
  {
    titulo: 'Margem Líquida',
    valor: 20,
    variacao: 3.5,
    tipo: 'percentage',
    cor: 'blue'
  },
  {
    titulo: 'Liquidez Corrente',
    valor: 1.33,
    variacao: -5.2,
    tipo: 'number',
    cor: 'yellow'
  }
];

export const mockChartDataFluxo: ChartData[] = [
  { name: 'Jan', value: 13000, receitas: 45000, despesas: 32000, saldo: 13000 },
  { name: 'Fev', value: 14000, receitas: 52000, despesas: 38000, saldo: 14000 },
  { name: 'Mar', value: 13000, receitas: 48000, despesas: 35000, saldo: 13000 },
  { name: 'Abr', value: 19000, receitas: 61000, despesas: 42000, saldo: 19000 },
  { name: 'Mai', value: 15000, receitas: 55000, despesas: 40000, saldo: 15000 },
  { name: 'Jun', value: 22000, receitas: 67000, despesas: 45000, saldo: 22000 },
  { name: 'Jul', value: 24000, receitas: 72000, despesas: 48000, saldo: 24000 },
  { name: 'Ago', value: 23000, receitas: 69000, despesas: 46000, saldo: 23000 },
  { name: 'Set', value: 25000, receitas: 75000, despesas: 50000, saldo: 25000 },
];

export const mockChartDataDRE: ChartData[] = [
  { name: 'Receita Bruta', value: 250000, valor: 250000 },
  { name: 'Receita Líquida', value: 220000, valor: 220000 },
  { name: 'Lucro Bruto', value: 110000, valor: 110000 },
  { name: 'Lucro Operacional', value: 50000, valor: 50000 },
  { name: 'Lucro Líquido', value: 50000, valor: 50000 },
];

export const mockChartDataBalanco: ChartData[] = [
  { name: 'Ativo Circulante', value: 200000, valor: 200000 },
  { name: 'Ativo Não Circulante', value: 300000, valor: 300000 },
  { name: 'Passivo Circulante', value: 150000, valor: 150000 },
  { name: 'Passivo Não Circulante', value: 100000, valor: 100000 },
  { name: 'Patrimônio Líquido', value: 250000, valor: 250000 },
];