'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

// Importar pages das features do CRM
import { LeadsPage } from '../leads/pages/LeadsPage';
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
        return <LeadsPage />;
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