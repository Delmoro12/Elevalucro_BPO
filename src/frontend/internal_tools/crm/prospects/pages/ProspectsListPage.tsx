'use client';

import React, { useState } from 'react';
import { Users, LayoutGrid, Table } from 'lucide-react';
import { useProspects } from '../hooks/useProspects';
import { ProspectsFilters } from '../components/ProspectsFilters';
import { ProspectsTable } from '../components/ProspectsTable';
import { ProspectsKanban } from '../components/ProspectsKanban';

export const ProspectsListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  
  const {
    prospects,
    loading,
    error,
    filters,
    updateFilters,
    deleteProspect,
    updateKanbanStage,
    refreshProspects,
  } = useProspects();


  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            Lista de Prospects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie todos os prospects cadastrados no sistema
          </p>
        </div>

        {/* Toggle de visualização */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'kanban' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'table' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Table className="h-4 w-4" />
            Tabela
          </button>
        </div>
      </div>


      {/* Filtros */}
      <ProspectsFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onRefresh={refreshProspects}
      />

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar prospects
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={refreshProspects}
                  className="bg-red-100 dark:bg-red-800 px-3 py-1 rounded text-sm text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {viewMode === 'kanban' ? (
        <ProspectsKanban
          prospects={prospects}
          loading={loading}
          onDelete={deleteProspect}
          onKanbanStageChange={updateKanbanStage}
          onProspectUpdate={refreshProspects}
        />
      ) : (
        <ProspectsTable
          prospects={prospects}
          loading={loading}
          onDelete={deleteProspect}
          onKanbanStageChange={updateKanbanStage}
          onProspectUpdate={refreshProspects}
        />
      )}

      {/* Informações adicionais */}
      {!loading && prospects.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              Mostrando {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4">
              <div>Controle: {prospects.filter(p => p.plan === 'controle').length}</div>
              <div>Gerencial: {prospects.filter(p => p.plan === 'gerencial').length}</div>
              <div>Avançado: {prospects.filter(p => p.plan === 'avancado').length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};