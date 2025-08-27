'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../src/frontend/lib/supabase';

export default function AuthCallbackRoute() {
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
          const user = data.session.user as any; // Type assertion para acessar campos não tipados
          
          console.log('=== AUTH CALLBACK DEBUG ===');
          console.log('User:', user.email);
          console.log('Full AMR:', user.amr);
          console.log('User metadata:', user.user_metadata);
          console.log('App metadata:', user.app_metadata);
          console.log('URL:', window.location.href);
          
          // Verificar se veio de um convite (tem type=invite na URL)
          const urlParams = new URLSearchParams(window.location.hash.substring(1));
          const inviteType = urlParams.get('type');
          
          console.log('URL Type:', inviteType);
          
          // Se veio de convite ou se é primeira vez (não tem password metadata), vai para set-password
          const isInvite = inviteType === 'invite';
          const needsPassword = !user.user_metadata?.password_set;
          
          console.log('Is Invite?', isInvite);
          console.log('Needs Password?', needsPassword);
          
          // SEMPRE forçar criação de senha se veio de convite
          if (isInvite || needsPassword) {
            console.log('>>> REDIRECTING TO SET PASSWORD');
            router.push('/auth/set-password');
            return;
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