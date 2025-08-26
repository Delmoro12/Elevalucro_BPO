'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔵 CALLBACK PAGE MOUNTED');
    console.log('🔵 Current URL:', window.location.href);
    
    const handleAuthCallback = async () => {
      try {
        console.log('🟢 Processing auth callback...');
        
        // Processar o callback do Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          console.log('=== AUTH CALLBACK DEBUG ===');
          console.log('User:', data.session.user.email);
          console.log('Full AMR:', data.session.user.amr);
          console.log('User metadata:', data.session.user.user_metadata);
          console.log('App metadata:', data.session.user.app_metadata);
          
          // Verificar como o usuário se autenticou
          const authMethods = data.session.user.amr?.map(m => m.method) || [];
          console.log('Auth methods found:', authMethods);
          
          const isOtpLogin = authMethods.includes('otp');
          const hasPassword = authMethods.includes('password');
          
          console.log('Is OTP login?', isOtpLogin);
          console.log('Has password?', hasPassword);
          
          // FORÇAR redirecionamento para set-password no primeiro acesso
          // Para teste, vamos sempre redirecionar se veio de OTP
          if (isOtpLogin) {
            console.log('>>> REDIRECTING TO SET PASSWORD');
            router.push('/auth/set-password');
            return; // Importante: parar execução aqui
          }
          
          console.log('>>> REDIRECTING TO DASHBOARD');
          router.push('/elevalucro_bpo_app/dashboard');
        } else {
          console.log('No session found, redirecting to auth');
          // Sem sessão, redirecionar para login
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        router.push('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Processando autenticação...
        </h2>
        <p className="text-gray-600">
          Você será redirecionado em instantes para o sistema.
        </p>
      </div>
    </div>
  );
}