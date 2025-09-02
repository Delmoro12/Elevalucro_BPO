'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';
import { supabase } from '@/src/lib/supabase';

// Importar páginas das features
import { DashboardFinanceiro } from '../dashboards/pages/DashboardFinanceiro';
import MyFinancePage from '../my_finance/pages/MyFinancePage';
import ActionsPage from '../actions/pages/ActionsPage';
import ApprovalsPage from '../approvals/pages/ApprovalsPage';
import DocumentsPage from '../documents/pages/DocumentsPage';
import TicketsPage from '../tickets/pages/TicketsPage';
import IntegrationsPage from '../integrations/pages/IntegrationsPage';
import { SignInPage } from '../auth/pages/SignInPage';

export const MainPage: React.FC = () => {
  const layoutProviderValue = useLayoutProvider();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState('dashboards');
  const [showClaimsModal, setShowClaimsModal] = useState(false);
  const [userClaims, setUserClaims] = useState(null);

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

  // DEBUG: Popup de JWT Claims - Apenas no Dashboard por 3 segundos
  useEffect(() => {
    const fetchUserClaims = async () => {
      console.log('🎯 Current page:', currentPage);
      
      // Só mostrar no dashboard
      if (currentPage !== 'dashboards') {
        console.log('❌ Not on dashboard, skipping popup');
        return;
      }
      
      console.log('✅ On dashboard, fetching claims...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📦 Session:', session);
        
        if (session?.user) {
          const user = session.user as any; // Type assertion para acessar campos não tipados
          console.log('🔍 User Claims from JWT:', user);
          setUserClaims({
            email: user.email,
            user_metadata: user.user_metadata,
            app_metadata: user.app_metadata,
            id: user.id,
            created_at: user.created_at
          } as any);
          setShowClaimsModal(true);
          console.log('✅ Modal shown!');
          
          // Auto-fechar após 1 segundo
          setTimeout(() => {
            setShowClaimsModal(false);
            console.log('⏰ Modal closed after 1 second');
          }, 1000);
        } else {
          console.log('❌ No user in session');
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    };

    fetchUserClaims();
  }, [currentPage]); // Trigger quando muda de página

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
    router.push(`/elevalucro_bpo_app/${url}`);
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

        {/* Claims Modal */}
        {showClaimsModal && userClaims && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 max-w-md w-80">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🔍 JWT Claims
                </h3>
                <button
                  onClick={() => setShowClaimsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <p className="text-sm text-gray-900 dark:text-white">{(userClaims as any).email}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{(userClaims as any).id}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Metadata:</span>
                  <pre className="text-xs bg-gray-100 dark:bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify((userClaims as any).user_metadata, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">App Metadata:</span>
                  <pre className="text-xs bg-gray-100 dark:bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify((userClaims as any).app_metadata, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date((userClaims as any).created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-b-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modal aparece a cada navegação/refresh da página
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutContext.Provider>
  );
};