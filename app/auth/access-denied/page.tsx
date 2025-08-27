'use client';

import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, LogOut } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Acesso Negado
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Você não tem permissão para acessar esta área. 
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>

          {/* Role Info */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Permissão necessária:</strong> BPO Side
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            
            <button
              onClick={handleGoToLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Fazer login com outra conta
            </button>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Precisa de ajuda? Entre em contato com{' '}
            <a 
              href="mailto:suporte@elevalucro.com.br" 
              className="text-emerald-600 hover:text-emerald-700"
            >
              suporte@elevalucro.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}