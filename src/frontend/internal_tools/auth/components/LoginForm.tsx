'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { signIn, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error: signInError } = await signIn(email, password);
    
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
      // Success - debug and redirect
      console.log('🎉 LOGIN SUCCESS - Starting debug...');
      
      // Debug session and cookies, then redirect
      setTimeout(async () => {
        console.log('🔍 DEBUG: Checking session after login...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('📋 Current session:', session);
        console.log('❌ Session error:', sessionError);
        
        // Check cookies
        const cookies = document.cookie;
        console.log('🍪 All cookies:', cookies);
        
        const accessToken = cookies.split('; ').find(row => row.startsWith('sb-access-token='));
        console.log('🎫 Access token cookie:', accessToken);
        
        // Try to decode JWT if available
        if (session?.access_token) {
          try {
            const payload = session.access_token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            console.log('🔓 JWT Payload:', decoded);
            console.log('🎭 App metadata:', decoded.app_metadata);
            console.log('👤 User metadata:', decoded.user_metadata);
          } catch (e) {
            console.error('❌ Error decoding JWT:', e);
          }
        }
        
        // Now redirect - use router.push for clean navigation
        console.log('🎯 Redirecting to /prospects');
        router.push('/prospects');
      }, 500); // Reduced delay since middleware is disabled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
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
            <span className="text-[11px] font-medium text-slate-900 dark:text-white" style={{ marginLeft: '-12px' }}>
              TOOLS
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Acesso Funcionários
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Entre com suas credenciais para acessar as ferramentas internas
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite seu email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua senha"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Lembrar de mim
              </label>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
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