'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Users, RotateCcw } from 'lucide-react';

// Importar pages das features do Operacional
import { ClientsMainPage } from '../clients/pages/ClientsMainPage';
import { OnboardingMainPage } from '../onboarding/pages/OnboardingMainPage';
import { RoutinesMainPage } from '../routines/pages/RoutinesMainPage';

interface OperationalMainPageProps {
  currentSubPage?: string;
  onSubPageChange?: (page: string) => void;
}

export const OperationalMainPage: React.FC<OperationalMainPageProps> = ({ 
  currentSubPage = 'onboarding', 
  onSubPageChange 
}) => {
  const [activeTab, setActiveTab] = useState(currentSubPage);

  // Sincronizar activeTab com currentSubPage quando a URL muda
  useEffect(() => {
    setActiveTab(currentSubPage);
  }, [currentSubPage]);

  const renderSubPageContent = () => {
    switch (activeTab) {
      case 'onboarding':
        return <OnboardingMainPage />;
      case 'operational-clients':
        return <ClientsMainPage />;
      case 'routines':
        return <RoutinesMainPage />;
      default:
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <UserCheck className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Onboarding Operacional
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      {/* Renderizar diretamente o conteúdo da sub-página sem header */}
      {renderSubPageContent()}
    </div>
  );
};