'use client';

import React from 'react';
import { Construction, ArrowLeft, Lightbulb, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UnderConstructionProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  estimatedDate?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title,
  description = "Esta funcionalidade está sendo desenvolvida pela nossa equipe.",
  showBackButton = true,
  estimatedDate
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone Principal */}
        <div className="mx-auto w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-12 w-12 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h1>

        {/* Descrição */}
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Data Estimada */}
        {estimatedDate && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Previsão de lançamento: {estimatedDate}
              </span>
            </div>
          </div>
        )}

        {/* Dica */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                Dica
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enquanto isso, você pode usar as outras funcionalidades disponíveis no menu lateral.
              </p>
            </div>
          </div>
        </div>

        {/* Botão Voltar */}
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};