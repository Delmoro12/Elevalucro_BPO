'use client';

import React from 'react';
import { Construction, Settings, Calendar, Lightbulb } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Módulo de Configurações
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configurações globais do sistema e administração
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Construction Icon */}
          <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-slate-600 dark:text-slate-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Funcionalidade em Desenvolvimento
          </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            O módulo de Configurações está sendo desenvolvido. Em breve você terá acesso a configurações 
            avançadas do sistema, personalização de workflows e administração de permissões.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                🔐 Gestão de Permissões
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Controle avançado de roles, permissões por módulo e configuração de acessos
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                ⚙️ Configurações do Sistema
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Personalizações globais, configurações de empresa e parâmetros operacionais
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                🔔 Notificações e Alertas
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configuração de alertas automáticos, notificações por email e webhooks
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                🔌 Integrações
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                APIs externas, configuração de webhooks e conectores com sistemas terceiros
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Cronograma de Desenvolvimento</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Previsão de lançamento: <strong>20/12/2025</strong>
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
                  Você pode gerenciar <strong>usuários</strong> através do módulo específico e configurar 
                  <strong>grupos DRE</strong> e <strong>contas financeiras</strong> nas páginas de clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};