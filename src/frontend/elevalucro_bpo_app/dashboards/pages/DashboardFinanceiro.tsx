'use client';

import React from 'react';
import { TrendingUp, DollarSign, Users, FileText, Lock, Star, Zap } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardWrapper } from '../components/DashboardWrapper';

export const DashboardFinanceiro: React.FC = () => {
  const { companyId, subscriptionPlan, loading: authLoading, isAuthenticated } = useAuth();

  // Debug: Verificar o plano do usuário
  console.log('🎯 DashboardFinanceiro - subscriptionPlan:', subscriptionPlan);
  console.log('🎯 DashboardFinanceiro - companyId:', companyId);

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Você precisa estar logado para visualizar o dashboard.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (false && !companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar o dashboard.
        </p>
      </div>
    );
  }

  // Verificar se o plano é avançado
  const hasAdvancedPlan = subscriptionPlan === 'avancado';

  // TEMPORÁRIO: Sempre mostrar dashboard para desenvolvimento
  // Se não tem plano avançado, mostrar tela de upgrade
  if (false && !hasAdvancedPlan) {
    return (
      <div className="space-y-6">
        {/* Header com informação do plano atual */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Dashboard Avançado Bloqueado
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Seu plano atual: <span className="font-medium capitalize">{subscriptionPlan || 'Não definido'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de upgrade */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Desbloqueie o Dashboard Avançado
            </h3>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Acesse insights financeiros avançados, relatórios detalhados e análises em tempo real 
              com o plano <span className="font-semibold text-purple-600 dark:text-purple-400">Avançado</span>.
            </p>

            {/* Recursos do plano avançado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Análises Avançadas</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Relatórios detalhados com insights financeiros e projeções
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/40 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Tempo Real</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dados atualizados automaticamente com sincronização instantânea
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/40 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Relatórios Customizados</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Crie e exporte relatórios personalizados para suas necessidades
                </p>
              </div>
            </div>

            {/* Botão de upgrade */}
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Fazer Upgrade para Plano Avançado
            </button>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Entre em contato com nossa equipe para mais informações
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se tem plano avançado, mostrar o dashboard completo
  return (
    <div className="space-y-6">
      {/* Header do plano avançado */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Dashboard Avançado
              </h2>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Recursos exclusivos do plano avançado ativados
              </p>
            </div>
          </div>
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            PLANO AVANÇADO
          </div>
        </div>
      </div>

      {/* Dashboard com Tabs */}
      <DashboardWrapper />
    </div>
  );
};