'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';

// Importar páginas das features
import { CrmMainPage } from '../crm/pages/CrmMainPage';

export const MainPage: React.FC = () => {
  const layoutProviderValue = useLayoutProvider();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState('crm');
  const [currentSubPage, setCurrentSubPage] = useState('prospects');

  // Mapear pathname para página
  const getPageFromPathname = (pathname: string): { page: string; subPage?: string } => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Encontrar 'internal_tools' e pegar o próximo segmento
    const toolsIndex = segments.indexOf('internal_tools');
    if (toolsIndex !== -1 && segments[toolsIndex + 1]) {
      const mainPage = segments[toolsIndex + 1];
      const subPage = segments[toolsIndex + 2];
      
      switch (mainPage) {
        case 'leads':
          return { page: 'crm', subPage: 'leads' };
        case 'prospects':
          return { page: 'crm', subPage: 'prospects' };
        case 'customer-success':
          return { page: 'crm', subPage: 'customer-success' };
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

  // Sincronizar página atual com URL
  useEffect(() => {
    const { page, subPage } = getPageFromPathname(pathname);
    setCurrentPage(page);
    if (subPage) {
      setCurrentSubPage(subPage);
    }
  }, [pathname]);

  // Função para navegar entre páginas
  const handlePageChange = (page: string) => {
    // Se clicou em CRM no sidebar, vai para prospects
    if (page === 'crm') {
      setCurrentPage('crm');
      setCurrentSubPage('prospects');
      router.push('/internal_tools/prospects');
      return;
    }

    setCurrentPage(page);
    
    // Mapear página interna para URL
    const urlMap: { [key: string]: string } = {
      'leads': 'leads',
      'prospects': 'prospects',
      'customer-success': 'customer-success',
      'analytics': 'analytics',
      'settings': 'settings'
    };
    
    const url = urlMap[page] || 'prospects';
    router.push(`/internal_tools/${url}`);
  };

  // Função para navegar entre sub-páginas do CRM
  const handleSubPageChange = (subPage: string) => {
    setCurrentSubPage(subPage);
    router.push(`/internal_tools/${subPage}`);
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
      case 'analytics':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Analytics
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Configurações
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        );
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