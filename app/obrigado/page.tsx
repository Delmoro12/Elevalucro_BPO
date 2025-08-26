'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function ObrigadoRoute() {
  const searchParams = useSearchParams();

  // Get plan from URL params
  const plano = searchParams?.get('plano') || 'controle';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Obrigado!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Recebemos seu interesse no plano <strong className="text-emerald-600">{plano}</strong>.
        </p>
        
        <p className="text-gray-500 mb-8">
          Nossa equipe entrará em contato em breve para dar continuidade ao seu processo.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Aguarde o contato da nossa equipe comercial.
          </p>
        </div>
      </div>
    </div>
  );
}