'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type FilterType = 'todas' | 'abertas' | 'pagas' | 'atrasadas';
type TabType = 'receitas' | 'despesas';

interface Receita {
  id: number;
  cliente: string;
  descricao: string;
  valor: string;
  vencimento: string;
  fatura: string;
  status: 'aberta' | 'paga' | 'atrasada';
  dataPagamento?: string;
}

const contasReceber: Receita[] = [
  {
    id: 1,
    cliente: "Tech Solutions Ltda",
    descricao: "Serviços de contabilidade - Janeiro 2025",
    valor: "R$ 2.500,00",
    vencimento: "25/01/2025",
    fatura: "FAT-2025001",
    status: "aberta"
  },
  {
    id: 2,
    cliente: "Mercado Central",
    descricao: "Consultoria fiscal - Janeiro 2025",
    valor: "R$ 1.800,00",
    vencimento: "30/01/2025",
    fatura: "FAT-2025002",
    status: "aberta"
  },
  {
    id: 3,
    cliente: "Clínica Santa Maria",
    descricao: "Gestão financeira - Janeiro 2025",
    valor: "R$ 3.200,00",
    vencimento: "15/01/2025",
    fatura: "FAT-2025003",
    status: "atrasada"
  },
  {
    id: 4,
    cliente: "Restaurante Bom Sabor",
    descricao: "Processamento de folha de pagamento",
    valor: "R$ 1.500,00",
    vencimento: "20/01/2025",
    fatura: "FAT-2025004",
    status: "paga",
    dataPagamento: "18/01/2025"
  },
  {
    id: 5,
    cliente: "Construtora ABC",
    descricao: "Auditoria interna - 4º trimestre 2024",
    valor: "R$ 4.500,00",
    vencimento: "10/01/2025",
    fatura: "FAT-2025005",
    status: "atrasada"
  },
  {
    id: 6,
    cliente: "Hotel Vista Mar",
    descricao: "Serviços contábeis - Janeiro 2025",
    valor: "R$ 2.800,00",
    vencimento: "28/01/2025",
    fatura: "FAT-2025006",
    status: "aberta"
  },
  {
    id: 7,
    cliente: "Farmácia Saúde Total",
    descricao: "Consultoria tributária - Janeiro 2025",
    valor: "R$ 1.200,00",
    vencimento: "22/01/2025",
    fatura: "FAT-2025007",
    status: "paga",
    dataPagamento: "20/01/2025"
  },
  {
    id: 8,
    cliente: "Escritório de Advocacia Lima",
    descricao: "Gestão contábil - Janeiro 2025",
    valor: "R$ 2.000,00",
    vencimento: "31/01/2025",
    fatura: "FAT-2025008",
    status: "aberta"
  },
  {
    id: 9,
    cliente: "Loja de Roupas Fashion",
    descricao: "Declarações fiscais - Janeiro 2025",
    valor: "R$ 900,00",
    vencimento: "12/01/2025",
    fatura: "FAT-2025009",
    status: "atrasada"
  },
  {
    id: 10,
    cliente: "Padaria do Bairro",
    descricao: "Serviços contábeis - Janeiro 2025",
    valor: "R$ 800,00",
    vencimento: "26/01/2025",
    fatura: "FAT-2025010",
    status: "aberta"
  },
  {
    id: 11,
    cliente: "Academia Corpo e Mente",
    descricao: "Consultoria financeira - Janeiro 2025",
    valor: "R$ 1.600,00",
    vencimento: "24/01/2025",
    fatura: "FAT-2025011",
    status: "paga",
    dataPagamento: "22/01/2025"
  },
  {
    id: 12,
    cliente: "Transportadora Rápida",
    descricao: "Auditoria mensal - Janeiro 2025",
    valor: "R$ 3.500,00",
    vencimento: "29/01/2025",
    fatura: "FAT-2025012",
    status: "aberta"
  },
  {
    id: 13,
    cliente: "Petshop Amigo Fiel",
    descricao: "Gestão tributária - Janeiro 2025",
    valor: "R$ 1.100,00",
    vencimento: "18/01/2025",
    fatura: "FAT-2025013",
    status: "paga",
    dataPagamento: "16/01/2025"
  },
  {
    id: 14,
    cliente: "Oficina Mecânica Central",
    descricao: "Processamento contábil - Janeiro 2025",
    valor: "R$ 1.400,00",
    vencimento: "27/01/2025",
    fatura: "FAT-2025014",
    status: "aberta"
  },
  {
    id: 15,
    cliente: "Imobiliária Prime",
    descricao: "Consultoria fiscal e contábil - Janeiro 2025",
    valor: "R$ 2.200,00",
    vencimento: "23/01/2025",
    fatura: "FAT-2025015",
    status: "aberta"
  }
];

export const FinanceTabsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('receitas');
  const [statusFilterReceitas, setStatusFilterReceitas] = useState<FilterType>('todas');
  const [statusFilterDespesas, setStatusFilterDespesas] = useState<FilterType>('todas');

  const getFilteredReceitas = () => {
    if (statusFilterReceitas === 'todas') return contasReceber;
    return contasReceber.filter(receita => {
      if (statusFilterReceitas === 'abertas') return receita.status === 'aberta';
      if (statusFilterReceitas === 'pagas') return receita.status === 'paga';
      if (statusFilterReceitas === 'atrasadas') return receita.status === 'atrasada';
      return true;
    });
  };

  const getStatusColor = (status: 'aberta' | 'paga' | 'atrasada') => {
    switch (status) {
      case 'aberta':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
      case 'paga':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
      case 'atrasada':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const StatusFilters: React.FC<{
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    type: TabType;
    counts: { todas: number; abertas: number; pagas: number; atrasadas: number };
  }> = ({ activeFilter, onFilterChange, type, counts }) => {
    const isReceitas = type === 'receitas';
    const activeColor = isReceitas 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-red-600 dark:text-red-400';
    const activeBarColor = isReceitas 
      ? 'bg-emerald-600 dark:bg-emerald-400' 
      : 'bg-red-600 dark:bg-red-400';

    const filters = [
      {
        key: 'todas' as FilterType,
        label: 'Todas',
        count: counts.todas,
        badgeClass: 'bg-slate-100 dark:bg-slate-700'
      },
      {
        key: 'abertas' as FilterType,
        label: 'Em Aberto',
        count: counts.abertas,
        badgeClass: isReceitas 
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
          : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
      },
      {
        key: 'pagas' as FilterType,
        label: isReceitas ? 'Recebidas' : 'Pagas',
        count: counts.pagas,
        badgeClass: isReceitas 
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
      },
      {
        key: 'atrasadas' as FilterType,
        label: 'Atrasadas',
        count: counts.atrasadas,
        badgeClass: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
      }
    ];

    return (
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`flex-shrink-0 px-4 py-2 font-medium text-sm transition-colors relative whitespace-nowrap ${
                activeFilter === filter.key
                  ? activeColor
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {filter.label}
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${filter.badgeClass}`}>
                {filter.count}
              </span>
              {activeFilter === filter.key && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${activeBarColor}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Tabs - Posicionadas fora do card */}
      <div className="flex mb-0">
        <button
          onClick={() => setActiveTab('receitas')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'receitas'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-t border-l border-r border-slate-200 dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Minhas Receitas
        </button>
        <button
          onClick={() => setActiveTab('despesas')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg ml-2 transition-colors ${
            activeTab === 'despesas'
              ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-t border-l border-r border-slate-200 dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Minhas Despesas
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700">
        {activeTab === 'receitas' ? (
          <>
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Minhas Receitas
              </h3>
            </div>
            
            <StatusFilters
              activeFilter={statusFilterReceitas}
              onFilterChange={setStatusFilterReceitas}
              type="receitas"
              counts={{
                todas: 15,
                abertas: 9,
                pagas: 4,
                atrasadas: 3
              }}
            />
            
            {/* Lista de Contas a Receber */}
            <div className="space-y-3">
              {getFilteredReceitas().map((receita) => (
                <div
                  key={receita.id}
                  className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {receita.cliente}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receita.status)}`}>
                          {receita.status === 'aberta' ? 'Em Aberto' : 
                           receita.status === 'paga' ? 'Recebida' : 'Atrasada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {receita.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>Vencimento: {receita.vencimento}</span>
                        <span>Fatura: {receita.fatura}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {receita.valor}
                      </div>
                      {receita.status === 'paga' && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Recebido em {receita.dataPagamento}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Minhas Despesas
              </h3>
            </div>
            
            <StatusFilters
              activeFilter={statusFilterDespesas}
              onFilterChange={setStatusFilterDespesas}
              type="despesas"
              counts={{
                todas: 15,
                abertas: 7,
                pagas: 6,
                atrasadas: 2
              }}
            />
            
            <p className="text-slate-600 dark:text-slate-400">
              {statusFilterDespesas === 'todas' && 'Visualizando todas as despesas.'}
              {statusFilterDespesas === 'abertas' && 'Visualizando despesas em aberto.'}
              {statusFilterDespesas === 'pagas' && 'Visualizando despesas pagas.'}
              {statusFilterDespesas === 'atrasadas' && 'Visualizando despesas atrasadas.'}
              {' '}Esta é uma página em desenvolvimento.
            </p>
          </>
        )}
      </div>
    </div>
  );
};