'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';

// Importar páginas das features
import { CrmMainPage } from '../crm/pages/CrmMainPage';
import { OperationalMainPage } from '../operational/pages/OperationalMainPage';
import { UsersMainPage } from '../users/pages/UsersMainPage';
import { AnalyticsPage } from '../analytics/pages/AnalyticsPage';
import { SettingsPage } from '../settings/pages/SettingsPage';

export const MainPage: React.FC = () => {
  const layoutProviderValue = useLayoutProvider();
  const router = useRouter();
  const pathname = usePathname();
  
  // Mapear pathname para página
  const getPageFromPathname = (pathname: string): { page: string; subPage?: string } => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Para tools subdomain, as rotas são diretas (ex: /leads, /prospects)
    if (segments.length > 0) {
      const mainPage = segments[0];
      
      switch (mainPage) {
        case 'leads':
          return { page: 'crm', subPage: 'leads' };
        case 'prospects':
          return { page: 'crm', subPage: 'prospects' };
        case 'customer-success':
          return { page: 'crm', subPage: 'customer-success' };
        case 'onboarding':
          return { page: 'operacional', subPage: 'onboarding' };
        case 'operational-clients':
          return { page: 'operacional', subPage: 'operational-clients' };
        case 'routines':
          return { page: 'operacional', subPage: 'routines' };
        case 'users':
          return { page: 'users' };
        case 'analytics':
          return { page: 'analytics' };
        case 'settings':
          return { page: 'settings' };
        default:
          return { page: 'crm', subPage: 'prospects' };
      }
    }
    
    return { page: 'crm', subPage: 'prospects' };
  };
  
  // Inicializar estado com valores corretos baseados na URL atual
  const initialPageData = getPageFromPathname(pathname);
  const [currentPage, setCurrentPage] = useState(initialPageData.page);
  const [currentSubPage, setCurrentSubPage] = useState(initialPageData.subPage || '');

  // Sincronizar página atual com URL quando mudar
  useEffect(() => {
    const { page, subPage } = getPageFromPathname(pathname);
    setCurrentPage(page);
    setCurrentSubPage(subPage || '');
  }, [pathname]);

  // Função para navegar entre páginas
  const handlePageChange = (page: string) => {
    // Mapear página interna para URL (rotas diretas no tools subdomain)
    const urlMap: { [key: string]: string } = {
      'leads': '/leads',
      'prospects': '/prospects', 
      'customer-success': '/customer-success',
      'onboarding': '/onboarding',
      'operational-clients': '/operational-clients',
      'routines': '/routines',
      'users': '/users',
      'analytics': '/analytics',
      'settings': '/settings'
    };
    
    // Verificar se é um submenu do CRM
    if (['leads', 'prospects', 'customer-success'].includes(page)) {
      setCurrentPage('crm');
      setCurrentSubPage(page);
      router.push(urlMap[page]);
      return;
    }
    
    // Verificar se é um submenu do Operacional
    if (['onboarding', 'operational-clients', 'routines'].includes(page)) {
      setCurrentPage('operacional');
      setCurrentSubPage(page);
      router.push(urlMap[page]);
      return;
    }
    
    // Se clicou em CRM no sidebar (menu pai), vai para prospects
    if (page === 'crm') {
      setCurrentPage('crm');
      setCurrentSubPage('prospects');
      router.push('/prospects');
      return;
    }
    
    // Se clicou em Operacional no sidebar (menu pai), vai para onboarding
    if (page === 'operacional') {
      setCurrentPage('operacional');
      setCurrentSubPage('onboarding');
      router.push('/onboarding');
      return;
    }

    // Para outros menus sem submenu (users, analytics, settings)
    setCurrentPage(page);
    setCurrentSubPage('');
    
    const url = urlMap[page];
    if (url) {
      router.push(url);
    }
  };

  // Função para navegar entre sub-páginas do CRM
  const handleSubPageChange = (subPage: string) => {
    setCurrentSubPage(subPage);
    router.push(`/${subPage}`);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'crm':
        return (
          <CrmMainPage 
            currentSubPage={currentSubPage}
            onSubPageChange={handleSubPageChange}
          />
        );
      case 'operacional':
        return (
          <OperationalMainPage 
            currentSubPage={currentSubPage}
            onSubPageChange={handleSubPageChange}
          />
        );
      case 'users':
        return <UsersMainPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <CrmMainPage 
            currentSubPage={currentSubPage}
            onSubPageChange={handleSubPageChange}
          />
        );
    }
  };

  return (
    <LayoutContext.Provider value={layoutProviderValue}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar 
          collapsed={layoutProviderValue.sidebarCollapsed} 
          onToggle={layoutProviderValue.toggleSidebar}
          currentPage={currentPage}
          currentSubPage={currentSubPage}
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