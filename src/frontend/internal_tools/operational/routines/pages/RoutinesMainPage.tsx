'use client';

import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { RoutineFilters } from '../types/routines';
import { RoutinesFilters } from '../components/RoutinesFilters';
import { RoutinesTableView } from '../components/RoutinesTableView';
import { useRoutines } from '../hooks/useRoutines';

export const RoutinesMainPage: React.FC = () => {
  const [filters, setFilters] = useState<RoutineFilters>({});
  const { routines, loading, error, fetchRoutines } = useRoutines();

  const handleFiltersChange = (newFilters: RoutineFilters) => {
    setFilters(newFilters);
    fetchRoutines(newFilters);
  };

  const handleRefresh = () => {
    fetchRoutines(filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CalendarCheck className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rotinas Operacionais
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhamento de rotinas de todas as empresas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <RoutinesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
      />

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800 dark:text-red-200">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Rotinas */}
      <RoutinesTableView
        routines={routines}
        loading={loading}
      />
    </div>
  );
};