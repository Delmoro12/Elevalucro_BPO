'use client';

import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { RoutinesHistoryTable } from '../components/RoutinesHistoryTable';
import { useAuth } from '../../auth/contexts/AuthContext';

export const RoutinesPage: React.FC = () => {
  const { companyId, user, loading: authLoading, isAuthenticated } = useAuth();

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
          Você precisa estar logado para visualizar o histórico de rotinas.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar o histórico de rotinas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarCheck className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Histórico de Rotinas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe todas as rotinas executadas para sua empresa
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <RoutinesHistoryTable companyId={companyId} />
    </div>
  );
};