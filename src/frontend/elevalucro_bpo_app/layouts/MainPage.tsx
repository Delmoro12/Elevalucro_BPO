'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';
import { ThemeProvider } from '../shared/components/ThemeProvider';
import { AuthProvider } from '../auth/contexts/AuthContext';

// Importar páginas das features
import { DashboardFinanceiro } from '../dashboards/pages/DashboardFinanceiro';
import MyFinancePage from '../my_finance/pages/MyFinancePage';
import FinancialRegistersPage from '../financial_registers/pages/FinancialRegistersPage';
import ActionsPage from '../actions/pages/ActionsPage';
import ApprovalsPage from '../approvals/pages/ApprovalsPage';
import DocumentsPage from '../documents/pages/DocumentsPage';
import TicketsPage from '../tickets/pages/TicketsPage';
import IntegrationsPage from '../integrations/pages/IntegrationsPage';
import { ConfigPage } from '../config/pages/ConfigPage';
import SupplierAndCustomerRegistrationPage from '../supplier_and_customer_registration/pages/SupplierAndCustomerRegistrationPage';
import { AccessesPage } from '../accesses/pages/AccessesPage';
import { RoutinesPage } from '../routines/pages/RoutinesPage';
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
      case 'my-finance':
        return 'my_finance';
      case 'financial-registers':
        return 'financial_registers';
      case 'actions':
        return 'actions';
      case 'approvals':
        return 'approvals';
      case 'documents':
        return 'documents';
      case 'tickets':
        return 'tickets';
      case 'integrations':
        return 'integrations';
      case 'config':
        return 'config';
      case 'supplier-and-customer-registration':
        return 'supplier_and_customer_registration';
      case 'accesses':
        return 'accesses';
      case 'app-routines':
        return 'routines';
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
      'my_finance': 'my-finance',
      'financial_registers': 'financial-registers',
      'actions': 'actions',
      'dashboards': 'dashboard',
      'approvals': 'approvals',
      'documents': 'documents',
      'tickets': 'tickets',
      'integrations': 'integrations',
      'config': 'config',
      'supplier_and_customer_registration': 'supplier-and-customer-registration',
      'accesses': 'accesses',
      'routines': 'app-routines',
      'auth': 'auth/login'
    };
    const url = urlMap[page] || page;
    router.push(`/${url}`);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboards':
        return <DashboardFinanceiro />;
      case 'my_finance':
        return <MyFinancePage />;
      case 'financial_registers':
        return <FinancialRegistersPage />;
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
      case 'config':
        return <ConfigPage />;
      case 'supplier_and_customer_registration':
        return <SupplierAndCustomerRegistrationPage />;
      case 'accesses':
        return <AccessesPage />;
      case 'routines':
        return <RoutinesPage />;
      case 'auth':
        return <SignInPage />;
      default:
        return <DashboardFinanceiro />;
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider>
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
      </ThemeProvider>
    </AuthProvider>
  );
};