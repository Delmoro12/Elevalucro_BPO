'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Target, FileText, TrendingUp } from 'lucide-react';

// Importar pages das features do CRM
import { ProspectsListPage } from '../prospects/pages/ProspectsListPage';
import { CustomerSuccessListPage } from '../customer_success/pages/CustomerSuccessListPage';

interface CrmMainPageProps {
  currentSubPage?: string;
  onSubPageChange?: (page: string) => void;
}

const crmSubPages = [
  {
    id: 'leads',
    label: 'Leads',
    icon: Target,
    description: 'Gerencie leads e oportunidades'
  },
  {
    id: 'prospects',
    label: 'Prospects',
    icon: Target,
    description: 'Gerencie prospects qualificados'
  },
  {
    id: 'customer-success',
    label: 'Sucesso do Cliente',
    icon: Users,
    description: 'Acompanhamento e satisfação dos clientes'
  }
];

export const CrmMainPage: React.FC<CrmMainPageProps> = ({ 
  currentSubPage = 'prospects', 
  onSubPageChange 
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(currentSubPage);

  // Sincronizar activeTab com currentSubPage quando a URL muda
  useEffect(() => {
    setActiveTab(currentSubPage);
  }, [currentSubPage]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onSubPageChange) {
      onSubPageChange(tabId);
    }
    // Navegar para a rota correspondente
    router.push(`/internal_tools/${tabId}`);
  };

  const renderSubPageContent = () => {
    switch (activeTab) {
      case 'leads':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Leads
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        );
      case 'prospects':
        return <ProspectsListPage />;
      case 'customer-success':
        return <CustomerSuccessListPage />;
      default:
        return <ProspectsListPage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do CRM */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Central de Relacionamento
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie prospects, clientes e relacionamentos comerciais
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Tabs de navegação */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {crmSubPages.map((page) => {
              const Icon = page.icon;
              const isActive = activeTab === page.id;
              
              return (
                <button
                  key={page.id}
                  onClick={() => handleTabChange(page.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {page.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo da sub-página */}
      <div>
        {renderSubPageContent()}
      </div>
    </div>
  );
};