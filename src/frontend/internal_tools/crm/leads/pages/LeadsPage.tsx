'use client';

import React from 'react';
import { Construction, Target, Calendar, Lightbulb } from 'lucide-react';

export const LeadsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Módulo de Leads
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gerenciamento de leads e captação
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Construction Icon */}
          <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Funcionalidade em Desenvolvimento
          </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            O módulo de gerenciamento de leads está sendo desenvolvido. Em breve você poderá capturar, 
            qualificar e converter leads em prospects de forma automatizada.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                📈 Captação Automatizada
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Integração com formulários e landing pages para captura automática de leads
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                🎯 Qualificação Inteligente
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sistema de pontuação e qualificação automática baseado em critérios personalizados
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                📊 Dashboard Analítico
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Métricas de conversão, funil de vendas e relatórios de performance
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                🔄 Conversão para Prospects
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fluxo automatizado para converter leads qualificados em prospects ativos
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Cronograma de Desenvolvimento</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Previsão de lançamento: <strong>10/10/2025</strong>
            </p>
          </div>

          {/* Tip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Enquanto isso...
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Você pode usar o módulo de <strong>Prospects</strong> para gerenciar seus contatos 
                  comerciais e o <strong>Customer Success</strong> para acompanhar clientes ativos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};