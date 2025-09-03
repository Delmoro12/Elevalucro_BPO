'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LayoutContext, useLayoutProvider } from '../shared/hooks/useLayout';
import { ThemeProvider } from '../shared/components/ThemeProvider';
import { AuthProvider } from '../auth/contexts/AuthContext';
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

  // Function to refresh token and fetch claims
  const refreshTokenAndFetchClaims = useCallback(async (forceRefresh = false) => {
    try {
      console.log(forceRefresh ? '🔄 Force refreshing token...' : '📦 Getting current session...');
      
      // Force refresh if requested
      if (forceRefresh) {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('❌ Error refreshing session:', error);
          return;
        }
        console.log('✅ Token refreshed successfully');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📦 Current Session:', session);
      
      if (session?.user && session.access_token) {
        // IMPORTANT: Decode JWT to get actual claims
        let decodedToken: any = {};
        try {
          const token = session.access_token;
          const parts = token.split('.');
          
          // Verificar se o token tem 3 partes
          if (parts.length !== 3) {
            console.warn('Token JWT inválido: não tem 3 partes');
          } else {
            let payload = parts[1];
            
            // Adicionar padding se necessário
            const padding = payload.length % 4;
            if (padding) {
              payload += '='.repeat(4 - padding);
            }
            
            // Substituir caracteres URL-safe para base64 padrão
            payload = payload.replace(/-/g, '+').replace(/_/g, '/');
            
            decodedToken = JSON.parse(atob(payload));
            console.log('🔓 Decoded JWT Token:', decodedToken);
          }
        } catch (err) {
          console.error('Error decoding JWT:', err);
          console.error('Token que falhou:', session?.access_token?.substring(0, 50) + '...');
        }
        
        const user = session.user as any;
        console.log('🔍 User from Session:', {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata
        });
        
        console.log('🎯 Claims from Decoded JWT:', {
          user_metadata: decodedToken.user_metadata,
          app_metadata: decodedToken.app_metadata,
          role: decodedToken.role,
          company_id: decodedToken.user_metadata?.company_id,
          role_from_metadata: decodedToken.user_metadata?.role
        });
        
        // Use decoded token metadata instead of session.user metadata
        setUserClaims({
          email: user.email,
          user_metadata: decodedToken.user_metadata || user.user_metadata,
          app_metadata: decodedToken.app_metadata || user.app_metadata,
          id: user.id,
          created_at: user.created_at,
          jwt_decoded: decodedToken,
          access_token: session.access_token
        } as any);
        setShowClaimsModal(true);
        console.log('✅ Modal shown with decoded JWT claims!');
        
        // Auto-fechar após 5 segundos para dar tempo de ver os dados
        setTimeout(() => {
          setShowClaimsModal(false);
          console.log('⏰ Modal closed after 5 seconds');
        }, 5000);
      } else {
        console.log('❌ No user in session or no access token');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  }, []);

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
      await refreshTokenAndFetchClaims(false);
    };

    fetchUserClaims();
  }, [currentPage, refreshTokenAndFetchClaims]); // Trigger quando muda de página

  // Função para navegar entre páginas
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // Mapear ID interno para URL
    const urlMap: { [key: string]: string } = {
      'my_finance': 'my-finance',
      'actions': 'actions',
      'dashboards': 'dashboard',
      'approvals': 'approvals',
      'documents': 'documents',
      'tickets': 'tickets',
      'integrations': 'integrations',
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Metadata (from JWT):</span>
                  <pre className="text-xs bg-gray-100 dark:bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify((userClaims as any).user_metadata, null, 2)}
                  </pre>
                  {(userClaims as any).user_metadata?.company_id && (
                    <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 rounded">
                      <p className="text-xs text-green-800 dark:text-green-200">
                        ✅ Company ID: {(userClaims as any).user_metadata.company_id}
                      </p>
                      <p className="text-xs text-green-800 dark:text-green-200">
                        ✅ Role: {(userClaims as any).user_metadata.role || 'Not found'}
                      </p>
                    </div>
                  )}
                  {!(userClaims as any).user_metadata?.company_id && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                      <p className="text-xs text-red-800 dark:text-red-200">
                        ❌ Company ID not found in JWT claims
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200">
                        ❌ Role not found in JWT claims
                      </p>
                    </div>
                  )}
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

              {/* Debug Actions */}
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-b-lg space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setShowClaimsModal(false);
                      console.log('🔄 Manual refresh token requested');
                      setTimeout(async () => {
                        await refreshTokenAndFetchClaims(true);
                      }, 100);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    🔄 Refresh Token & Check Claims
                  </button>
                  <button
                    onClick={() => setShowClaimsModal(false)}
                    className="px-3 py-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hook version: {(userClaims as any).user_metadata?.jwt_hook_version || 'unknown'}
                </p>
              </div>
            </div>
          </div>
        )}
          </div>
        </LayoutContext.Provider>
      </ThemeProvider>
    </AuthProvider>
  );
};