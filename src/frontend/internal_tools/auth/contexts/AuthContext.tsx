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


  // Função para mapear role ID para nome - Atualizada com IDs corretos
  const mapRoleIdToName = (roleId: string): string | null => {
    const roleMap: Record<string, string> = {
      'a3ac4409-99ab-4b01-936b-d3ef18be0a3f': 'bpo_side',      // Equipe interna (produção)
      '55252fe8-6968-470e-87ec-f2ad79e49782': 'client_side',   // Clientes (produção)
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
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Internal Tools Auth event: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
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
      console.log('🔄 Redirecionando para login...');
      window.location.replace('/tools-auth/login');
      
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
      // Mesmo com erro, forçar limpeza e redirecionamento
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      console.log('🔄 Redirecionando para login (fallback)...');
      window.location.replace('/tools-auth/login');
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
    </AuthContext.Provider>
  );
};