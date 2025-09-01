'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

// Importar pages das features do CRM
import { ProspectsListPage } from '../prospects/pages/ProspectsListPage';
import { CustomerSuccessListPage } from '../customer_success/pages/CustomerSuccessListPage';

interface CrmMainPageProps {
  currentSubPage?: string;
  onSubPageChange?: (page: string) => void;
}


export const CrmMainPage: React.FC<CrmMainPageProps> = ({ 
  currentSubPage = 'prospects', 
  onSubPageChange 
}) => {
  const [activeTab, setActiveTab] = useState(currentSubPage);

  // Sincronizar activeTab com currentSubPage quando a URL muda
  useEffect(() => {
    setActiveTab(currentSubPage);
  }, [currentSubPage]);

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
    <div>
      {/* Renderizar diretamente o conteúdo da sub-página sem header */}
      {renderSubPageContent()}
    </div>
  );
};