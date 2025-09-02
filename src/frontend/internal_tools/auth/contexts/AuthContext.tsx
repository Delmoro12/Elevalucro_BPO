'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signing: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showJwtDebug, setShowJwtDebug] = useState(false);
  const [jwtDebugData, setJwtDebugData] = useState<any>(null);

  // Função para mostrar debug JWT
  const showJwtDebugPopup = (session: Session) => {
    try {
      const token = session.access_token;
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      const debugInfo = {
        email: session.user.email,
        userId: session.user.id,
        role: decoded.user_metadata?.role,
        roleName: decoded.user_metadata?.role,
        exp: new Date(decoded.exp * 1000).toLocaleString(),
        iat: new Date(decoded.iat * 1000).toLocaleString(),
        provider: decoded.app_metadata?.provider,
        providers: decoded.app_metadata?.providers
      };
      
      setJwtDebugData(debugInfo);
      setShowJwtDebug(true);
      
      // Auto-fechar após 1 segundo
      setTimeout(() => {
        setShowJwtDebug(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
    }
  };

  // Função para mapear role ID para nome - Atualizada com IDs corretos
  const mapRoleIdToName = (roleId: string): string | null => {
    const roleMap: Record<string, string> = {
      'c6c3bd3e-64f0-4a2e-aa7b-18c7cd2baf4e': 'bpo_side',
      '55252fe8-6968-470e-87ec-f2ad79e49782': 'client_side',
      '1': 'bpo_side',
      '2': 'client_side', 
      '3': 'admin',
    };
    return roleMap[roleId] || 'unknown';
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Show JWT debug popup for existing session
      if (session) {
        showJwtDebugPopup(session);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Internal Tools Auth event: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Show JWT debug popup when user signs in or session is restored
        if (event === 'SIGNED_IN' && session) {
          showJwtDebugPopup(session);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🚀 AuthContext signIn started:', { email, password: password ? '***' : 'empty' });
      setSigning(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📊 Supabase auth result:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message || null 
      });

      if (error) {
        console.error('❌ Internal Tools sign in error:', error);
        return { error };
      }

      console.log('✅ Internal Tools sign in successful:', {
        email: data.user?.email,
        metadata: data.user?.app_metadata
      });
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    } finally {
      setSigning(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando processo de logout...');
      setLoading(true);
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout do Supabase:', error);
      }
      
      // Limpar TODOS os cookies do domínio
      document.cookie.split(";").forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim();
        // Limpar para todos os domínios possíveis
        const domains = ['', '.localhost', 'tools.localhost', 'localhost'];
        const paths = ['/', '/auth', '/api'];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; ${domain ? `domain=${domain};` : ''}`;
          });
        });
      });
      
      console.log('🧹 Todos os cookies limpos');
      
      // Limpar localStorage e sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('🧹 Storage limpo');
      
      // Limpar estado do contexto
      setUser(null);
      setSession(null);
      
      console.log('✅ Logout concluído com sucesso');
      
      // Redirect to login page com reload forçado
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
      // Mesmo com erro, forçar limpeza e redirecionamento
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signing,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* JWT Debug Popup */}
      {showJwtDebug && jwtDebugData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                JWT Debug Info
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                3s auto-close
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{jwtDebugData.email}</span>
              </div>
              
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">User ID:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{jwtDebugData.userId}</span>
              </div>
              
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Role:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{jwtDebugData.role}</span>
              </div>
              
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Expires:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{jwtDebugData.exp}</span>
              </div>
              
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Issued:</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{jwtDebugData.iat}</span>
              </div>
              
              {jwtDebugData.provider && (
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Provider:</span>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">{jwtDebugData.provider}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};