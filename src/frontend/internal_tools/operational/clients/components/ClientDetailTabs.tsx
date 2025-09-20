'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  GitMerge, 
  Building, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Settings,
  Calendar,
  DollarSign,
  FileText,
  Target,
  AlertCircle,
  Clock,
  CheckCircle,
  Timer,
  UserPlus,
  Wallet,
  Key
} from 'lucide-react';
import { OperationalClient } from '../types/clients';
import { RoutinesTable } from './routines/RoutinesTable';
import { useRoutines } from '../hooks/useRoutines';
import { useRoutinesIndicators } from '../hooks/useRoutinesIndicators';
import { useAccountsPayableIndicators } from '../hooks/useAccountsPayableIndicators';
import { useAccountsReceivableIndicators } from '../hooks/useAccountsReceivableIndicators';
import { useRecordConciliation } from '../hooks/useRecordConciliation';
import { useClientsAccess } from '../hooks/useClientsAccess';
import { ClientDetailHeader } from './ClientDetailHeader';
import { ClientsSuppliersMainPage } from '../pages/ClientsSuppliersMainPage';
import { ConfigMainPage } from '../pages/ConfigMainPage';
import { AccountsPayableMainPage } from '../pages/AccountsPayableMainPage';
import { AccountsReceivableMainPage } from '../pages/AccountsReceivableMainPage';
import { CashMovementsMainPage } from '../pages/CashMovementsMainPage';
import { CashFlowMainPage } from '../pages/CashFlowMainPage';
import RecordConciliationMainPage from '../pages/RecordConciliationMainPage';
import { AccessPage } from '../pages/AccessPage';

interface ClientDetailTabsProps {
  client: OperationalClient;
}

type TabKey = 'rotinas' | 'conciliacao-registros' | 'conciliacao-bancaria' | 'contas-pagar' | 'movimentacoes' | 'contas-receber' | 'fluxo-caixa' | 'dre' | 'acessos' | 'cadastros' | 'configuracoes';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: Tab[] = [
  {
    key: 'rotinas',
    label: 'Rotinas',
    icon: RotateCcw,
  },
  {
    key: 'conciliacao-registros',
    label: 'Conciliação de Registros',
    icon: GitMerge,
  },
  {
    key: 'conciliacao-bancaria',
    label: 'Conciliação Bancária',
    icon: Building,
  },
  {
    key: 'contas-pagar',
    label: 'Contas a Pagar',
    icon: CreditCard,
  },
  {
    key: 'contas-receber',
    label: 'Contas a Receber',
    icon: Receipt,
  },
  {
    key: 'movimentacoes',
    label: 'Movimentações',
    icon: Wallet,
  },
  {
    key: 'fluxo-caixa',
    label: 'Fluxo de Caixa',
    icon: TrendingUp,
  },
  {
    key: 'dre',
    label: 'DRE',
    icon: BarChart3,
  },
  {
    key: 'acessos',
    label: 'Acessos',
    icon: Key,
  },
  {
    key: 'cadastros',
    label: 'Cadastros',
    icon: UserPlus,
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
  },
];

export const ClientDetailTabs: React.FC<ClientDetailTabsProps> = ({ client }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('rotinas');
  const [movementIndicators, setMovementIndicators] = useState<any[]>([]);
  const [cashFlowIndicators, setCashFlowIndicators] = useState<any[]>([]);
  
  // Hooks para dados específicos das tabs
  const { routines } = useRoutines(client.company_id);
  const routinesIndicators = useRoutinesIndicators(routines);
  const { indicators: accountsPayableIndicators } = useAccountsPayableIndicators(client.company_id);
  const { indicators: accountsReceivableIndicators } = useAccountsReceivableIndicators(client.company_id);
  const { stats: recordConciliationStats } = useRecordConciliation(client.company_id);
  const { access, total: totalAccess } = useClientsAccess(client.company_id);

  const getTabHeaderInfo = () => {
    switch (activeTab) {
      case 'rotinas':
        return {
          title: `Rotinas Operacionais - ${client.nome_empresa}`,
          subtitle: `${routinesIndicators.total} rotinas configuradas`,
          indicators: [
            {
              label: 'Total de Rotinas',
              value: routinesIndicators.total,
              icon: RotateCcw,
            },
            {
              label: 'Atrasadas',
              value: routinesIndicators.overdue,
              icon: AlertCircle,
              color: 'text-red-600 dark:text-red-400',
            },
            {
              label: 'Vence em Breve',
              value: routinesIndicators.dueSoon,
              icon: Clock,
              color: 'text-yellow-600 dark:text-yellow-400',
            },
            {
              label: 'Taxa de Sucesso',
              value: `${routinesIndicators.successRate30Days.toFixed(0)}%`,
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400',
            },
          ],
        };
      case 'conciliacao-registros':
        return {
          title: `Conciliação de Registros - ${client.nome_empresa}`,
          subtitle: 'Validação de registros enviados pelo cliente',
          indicators: [
            {
              label: 'Total de Registros',
              value: recordConciliationStats.total,
              icon: FileText,
            },
            {
              label: 'Aguardando Validação',
              value: recordConciliationStats.pending,
              icon: Clock,
              color: 'text-yellow-600 dark:text-yellow-400',
            },
            {
              label: 'Validados',
              value: recordConciliationStats.validated,
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400',
            },
            {
              label: 'Valor Pendente',
              value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(recordConciliationStats.totalValue),
              icon: DollarSign,
              color: 'text-emerald-600 dark:text-emerald-400',
            },
          ],
        };
      case 'contas-pagar':
        return {
          title: `Contas a Pagar - ${client.nome_empresa}`,
          subtitle: 'Gestão de contas a pagar e fornecedores',
          indicators: accountsPayableIndicators,
        };
      case 'contas-receber':
        return {
          title: `Contas a Receber - ${client.nome_empresa}`,
          subtitle: 'Gestão de contas a receber e clientes',
          indicators: accountsReceivableIndicators,
        };
      case 'movimentacoes':
        return {
          title: `Movimentações Financeiras - ${client.nome_empresa}`,
          subtitle: 'Controle de entradas e saídas de caixa',
          indicators: movementIndicators,
        };
      case 'fluxo-caixa':
        return {
          title: `Fluxo de Caixa - ${client.nome_empresa}`,
          subtitle: 'Análise e projeção do fluxo de caixa',
          indicators: cashFlowIndicators,
        };
      case 'acessos':
        return {
          title: `Acessos do Cliente - ${client.nome_empresa}`,
          subtitle: `${totalAccess} acessos cadastrados`,
          indicators: [
            {
              label: 'Total de Acessos',
              value: totalAccess,
              icon: Key,
              color: 'text-blue-600 dark:text-blue-400',
            },
            {
              label: 'Ativos',
              value: access.length,
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400',
            },
          ],
        };
      default:
        return {
          title: client.nome_empresa,
          subtitle: `Cliente desde ${new Date(client.data_inicio).toLocaleDateString('pt-BR')}`,
          indicators: [],
        };
    }
  };

  const renderTabContent = () => {
    const activeTabInfo = tabs.find(tab => tab.key === activeTab);
    const IconComponent = activeTabInfo?.icon || FileText;

    switch (activeTab) {
      case 'rotinas':
        return (
          <RoutinesTable clientId={client.company_id} />
        );

      case 'conciliacao-registros':
        return (
          <RecordConciliationMainPage companyId={client.company_id} />
        );

      case 'conciliacao-bancaria':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Building className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Conciliação Bancária
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Conciliação automática e manual de extratos bancários
            </p>
            <div className="mt-6 text-sm text-slate-500">
              Esta funcionalidade será implementada em breve
            </div>
          </div>
        );

      case 'contas-pagar':
        return (
          <AccountsPayableMainPage
            companyId={client.company_id}
            companyName={client.nome_empresa}
          />
        );

      case 'movimentacoes':
        return (
          <CashMovementsMainPage
            companyId={client.company_id}
            onIndicatorsChange={setMovementIndicators}
          />
        );

      case 'contas-receber':
        return (
          <AccountsReceivableMainPage
            companyId={client.company_id}
            companyName={client.nome_empresa}
          />
        );

      case 'fluxo-caixa':
        return (
          <CashFlowMainPage
            companyId={client.id}
            companyName={client.nome_empresa}
            onIndicatorsChange={setCashFlowIndicators}
          />
        );

      case 'dre':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              DRE - Demonstração do Resultado
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Relatórios financeiros e demonstração de resultados
            </p>
            <div className="mt-6 text-sm text-slate-500">
              Esta funcionalidade será implementada em breve
            </div>
          </div>
        );

      case 'acessos':
        return (
          <AccessPage companyId={client.company_id} />
        );

      case 'cadastros':
        return (
          <ClientsSuppliersMainPage
            companyId={client.company_id}
            companyName={client.nome_empresa}
          />
        );

      case 'configuracoes':
        return (
          <ConfigMainPage
            companyId={client.company_id}
            companyName={client.nome_empresa}
          />
        );

      default:
        return null;
    }
  };

  const headerInfo = getTabHeaderInfo();

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <ClientDetailHeader 
        client={client}
        activeTab={activeTab}
        tabTitle={headerInfo.title}
        tabSubtitle={headerInfo.subtitle}
        indicators={headerInfo.indicators}
      />

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none" 
             onMouseDown={(e) => {
               const element = e.currentTarget as HTMLElement;
               if (!element) return;
               
               const startX = e.pageX - element.offsetLeft;
               const scrollLeft = element.scrollLeft;
               
               const handleMouseMove = (e: MouseEvent) => {
                 const x = e.pageX - element.offsetLeft;
                 const walk = (x - startX) * 2;
                 element.scrollLeft = scrollLeft - walk;
               };
               
               const handleMouseUp = () => {
                 document.removeEventListener('mousemove', handleMouseMove);
                 document.removeEventListener('mouseup', handleMouseUp);
               };
               
               document.addEventListener('mousemove', handleMouseMove);
               document.addEventListener('mouseup', handleMouseUp);
             }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0
                  ${isActive 
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};