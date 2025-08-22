'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';

// Importar páginas das features
import { DashboardFinanceiro } from '../dashboards/pages/DashboardFinanceiro';
import { MyFinancePage } from '../my_finance/pages/MyFinancePage';
import { ActionsPage } from '../actions/pages/ActionsPage';
import { ApprovalsPage } from '../approvals/pages/ApprovalsPage';
import { DocumentsPage } from '../documents/pages/DocumentsPage';
import { TicketsPage } from '../tickets/pages/TicketsPage';
import { IntegrationsPage } from '../integrations/pages/IntegrationsPage';
import { SignInPage } from '../auth/pages/SignInPage';

export const MainPage: React.FC = () => {
  const layoutProviderValue = useLayoutProvider();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState('dashboards');

  // Mapear pathname para página
  const getPageFromPathname = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    switch (lastSegment) {
      case 'app':
      case 'dashboard':
        return 'dashboards';
      case 'minhas-financas':
        return 'my_finance';
      case 'acoes':
        return 'actions';
      case 'aprovacoes':
        return 'approvals';
      case 'documentos':
        return 'documents';
      case 'suporte':
        return 'tickets';
      case 'integracoes':
        return 'integrations';
      case 'login':
        return 'auth';
      default:
        return 'dashboards';
    }
  };

  // Sincronizar página atual com URL
  useEffect(() => {
    const page = getPageFromPathname(pathname);
    setCurrentPage(page);
  }, [pathname]);

  // Função para navegar entre páginas
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // Mapear ID interno para URL
    const urlMap: { [key: string]: string } = {
      'my_finance': 'minhas-financas',
      'actions': 'acoes',
      'dashboards': 'dashboard',
      'approvals': 'aprovacoes',
      'documents': 'documentos',
      'tickets': 'suporte',
      'integrations': 'integracoes',
      'auth': 'login'
    };
    const url = urlMap[page] || page;
    router.push(`/app/${url}`);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboards':
        return <DashboardFinanceiro />;
      case 'my_finance':
        return <MyFinancePage />;
      case 'actions':
        return <ActionsPage />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'auth':
        return <SignInPage />;
      default:
        return <DashboardFinanceiro />;
    }
  };

  return (
    <LayoutContext.Provider value={layoutProviderValue}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <Sidebar 
          collapsed={layoutProviderValue.sidebarCollapsed} 
          onToggle={layoutProviderValue.toggleSidebar}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Main content area */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${layoutProviderValue.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}>
          {/* Header */}
          <Header 
            onMenuClick={layoutProviderValue.toggleSidebar}
            sidebarCollapsed={layoutProviderValue.sidebarCollapsed}
            currentPage={currentPage}
          />

          {/* Page content */}
          <main className="flex-1 p-6">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};