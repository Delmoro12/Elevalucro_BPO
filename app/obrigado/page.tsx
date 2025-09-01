'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const plano = searchParams.get('plano') || 'seu plano';
  const valor = searchParams.get('valor') || '';
  const nome = searchParams.get('nome') || '';
  const empresa = searchParams.get('empresa') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Success */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Obrigado, {nome || 'Interessado'}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Recebemos sua solicitação para o plano <strong>{plano}</strong>
            </p>
            {valor && (
              <p className="text-lg text-gray-500">
                Valor mensal: <strong>R$ {valor}</strong>
              </p>
            )}
          </div>

          {/* Card de próximos passos */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <ArrowRight className="w-6 h-6 text-emerald-600 mr-2" />
                Próximos Passos
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <span>Nossa equipe irá <strong>elaborar o contrato</strong> com seus dados</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <span>Enviaremos em até <strong>24 horas</strong> para você assinar</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <span>Após assinado, iremos <strong>liberar o acesso</strong> à nossa plataforma</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <span>Iniciaremos a <strong>primeira reunião de onboarding</strong></span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA final */}
          <div className="text-center bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Transforme sua gestão financeira hoje mesmo!
            </h3>
            <p className="text-emerald-100 mb-6">
              Junte-se a centenas de empresas que já elevaram seus lucros conosco
            </p>
            <a 
              href="/"
              className="inline-flex items-center bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Voltar ao site
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ObrigadoContent />
    </Suspense>
  );
}