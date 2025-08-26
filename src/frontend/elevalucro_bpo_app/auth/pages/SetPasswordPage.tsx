'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDirectAccess, setIsDirectAccess] = useState(false);

  useEffect(() => {
    const token = searchParams?.get('token');
    const userId = searchParams?.get('user_id');
    
    if (token && userId) {
      setIsDirectAccess(true);
      console.log('🔗 Direct access detected:', { token: token.substring(0, 10) + '...', userId });
      // For direct access, we'll handle authentication differently
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isDirectAccess) {
        // For direct access, we need to sign in with admin-generated credentials first
        const userId = searchParams?.get('user_id');
        if (!userId) {
          setError('Token inválido');
          setIsLoading(false);
          return;
        }

        // Update password directly via admin API call to our edge function
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-user-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            user_id: userId,
            new_password: password
          })
        });

        if (!response.ok) {
          setError('Erro ao definir senha. Tente novamente.');
          setIsLoading(false);
          return;
        }

        console.log('✅ Password updated successfully');
        
        // Now sign in with the new password
        const { data: userData, error: signInError } = await supabase.auth.signInWithPassword({
          email: searchParams?.get('email') || '',
          password: password
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          setError('Senha definida, mas erro no login automático. Tente fazer login manualmente.');
          setIsLoading(false);
          return;
        }
      } else {
        // Regular password update for already authenticated users
        const { data: updateData, error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) {
          console.error('Error setting password:', error);
          setError('Erro ao definir senha. Tente novamente.');
          setIsLoading(false);
          return;
        }
      }

      // Senha definida com sucesso
      console.log('Password set successfully');
      
      // Fazer logout e redirecionar para login com a nova senha
      await supabase.auth.signOut();
      
      // Redirecionar para página de login com mensagem de sucesso
      router.push('/auth?message=password_set');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Erro inesperado. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Defina sua senha
          </h1>
          <p className="text-gray-600 mt-2">
            Crie uma senha segura para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Digite a senha novamente"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Requisitos da senha:</p>
            <ul className="space-y-1 ml-4">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                • Mínimo de 8 caracteres
              </li>
              <li className={password && password === confirmPassword ? 'text-green-600' : ''}>
                • As senhas devem coincidir
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Definindo senha...
              </span>
            ) : (
              'Definir senha e entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}