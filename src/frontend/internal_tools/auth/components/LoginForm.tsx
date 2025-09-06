'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { setupAuthInterceptor } from '@/src/lib/auth-interceptor';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { signIn, signing, signOut } = useAuth();
  const router = useRouter();

  const handleClearData = () => {
    try {
      console.log('🧹 Limpando todos os dados...');
      
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
      
      // Limpar localStorage e sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Todos os dados limpos');
      
      // Recarregar a página
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Login form submitted:', { email, password: password ? '***' : 'empty' });
    setError('');
    
    console.log('🔍 Calling signIn...');
    const { error: signInError } = await signIn(email, password);
    console.log('📋 SignIn result:', signInError ? 'ERROR' : 'SUCCESS');
    
    if (signInError) {
      console.error('Login error:', signInError);
      
      // Handle different error types
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } else {
      // Success - check cookies before redirect
      console.log('🎉 LOGIN SUCCESS - Checking cookies...');
      
      // Check if cookies are set
      setTimeout(() => {
        const cookies = document.cookie;
        console.log('🍪 Cookies after login:', cookies);
        
        const accessToken = cookies.split('; ').find(row => row.startsWith('sb-access-token='));
        console.log('🎫 Access token found:', !!accessToken);
        
        if (accessToken) {
          console.log('✅ Cookie token exists, redirecting...');
          window.location.href = '/prospects';
        } else {
          console.log('❌ No cookie token, checking session...');
          
          // Buscar token da sessão atual e armazenar no sessionStorage
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
              console.log('✅ Session token found, storing and redirecting...');
              sessionStorage.setItem('supabase-auth-token', session.access_token);
              setupAuthInterceptor(); // Setup interceptor para futuras requisições
              
              // Para resolver o problema do middleware, vamos forçar um cookie manual
              // Em produção, precisamos setar o domínio corretamente
              const isProduction = window.location.hostname.includes('elevalucro.com.br');
              
              // Setar cookie com domínio apropriado
              if (isProduction) {
                // Para produção, setar SEM domain para funcionar no subdomínio atual
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax; Secure`;
              } else {
                // Para localhost, não usar domain
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
              }
              console.log(`🍪 Cookie set manually for ${isProduction ? 'production' : 'localhost'}`);
              console.log(`🍪 Domain: ${isProduction ? 'tools.elevalucro.com.br (no domain attr)' : 'localhost'}`);
              console.log(`🍪 Token (first 50 chars): ${session.access_token.substring(0, 50)}...`);
              
              // === DIAGNÓSTICO COMPLETO ===
              console.log('=== DIAGNÓSTICO DE COOKIES E JWT ===');
              console.log('🌐 Hostname:', window.location.hostname);
              console.log('🔒 Protocol:', window.location.protocol);
              console.log('📍 Full URL:', window.location.href);
              
              // Aguardar um pouco para o cookie ser setado
              setTimeout(() => {
                console.log('🍪 Todos os cookies após setar:', document.cookie);
                const cookieValue = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='));
                console.log('🎫 Cookie sb-access-token encontrado:', !!cookieValue);
                
                if (cookieValue) {
                  const tokenValue = cookieValue.split('=')[1];
                  console.log('🔍 Token value (50 chars):', tokenValue.substring(0, 50) + '...');
                  
                  // Testar decodificação do JWT
                  try {
                    const payload = JSON.parse(atob(tokenValue.split('.')[1]));
                    console.log('🎫 JWT Payload completo:', payload);
                    console.log('👤 user_metadata:', payload.user_metadata);
                    console.log('⚙️ app_metadata:', payload.app_metadata);
                    console.log('🏷️ Role encontrada:', payload.user_metadata?.role || payload.app_metadata?.role);
                    console.log('📧 Email:', payload.email);
                    console.log('🆔 User ID:', payload.sub);
                  } catch (e) {
                    console.error('❌ Erro ao decodificar JWT:', e);
                  }
                } else {
                  console.error('❌ Cookie não foi encontrado após setar!');
                }
              }, 100);
              
              window.location.href = '/prospects';
            } else {
              console.log('❌ No session token found');
              setError('Erro interno: Não foi possível obter token de acesso.');
            }
          });
        }
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header com Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/images/Logo ElevaLucro.png"
              alt="ElevaLucro"
              width={180}
              height={90}
              className="object-contain"
            />
            <span className="text-[11px] font-medium text-emerald-400" style={{ marginLeft: '-12px' }}>
              TOOLS
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Acesso Funcionários
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Entre com suas credenciais para acessar as ferramentas internas
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-slate-800 py-8 px-6 shadow-lg rounded-lg border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-600 placeholder-slate-400 text-white bg-slate-700 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Digite seu email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-slate-600 placeholder-slate-400 text-white bg-slate-700 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Digite sua senha"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Lembrar de mim */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-600 bg-slate-700 rounded transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Lembrar de mim
              </label>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              {/* Botão de Login */}
              <button
                type="submit"
                disabled={signing}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {signing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
              
              {/* Botão Limpar Dados */}
              <button
                type="button"
                onClick={handleClearData}
                className="group relative w-full flex justify-center py-2 px-4 border border-slate-600 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados do Navegador
              </button>
              
              {/* Botão Logout (se usuário já estiver logado) */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    console.log('🚪 Fazendo logout...');
                    await signOut();
                  } catch (error) {
                    console.error('❌ Erro no logout:', error);
                    window.location.href = '/tools-auth/login';
                  }
                }}
                className="group relative w-full flex justify-center py-2 px-4 border border-slate-600 text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Fazer Logout
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2025 ElevaLucro Tools. Acesso restrito a funcionários.
          </p>
        </div>
      </div>
    </div>
  );
};