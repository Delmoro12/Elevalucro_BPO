'use client';

import React, { useState } from 'react';
import { Key, ExternalLink, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { DataTable03Column } from '../../shared/components/DataTable03';
import { ClientAccess } from '../types/accesses';
import { useAccesses } from '../hooks/useAccesses';

interface AccessesTableProps {
  companyId: string;
  onEdit?: (access: ClientAccess) => void;
  onDelete?: (access: ClientAccess) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export const AccessesTable: React.FC<AccessesTableProps> = ({
  companyId,
  onEdit,
  onDelete,
  onCreate,
  onRefresh
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Hook para buscar dados reais
  const { accesses, loading, error, updateFilters } = useAccesses();

  // Handler para busca
  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilters({ search: value });
  };

  // Definir colunas da tabela
  const columns: DataTable03Column<ClientAccess>[] = [
    {
      key: 'description',
      title: 'Descrição',
      width: '300px',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{value}</p>
            {record.url && (
              <a
                href={record.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                <span>Acessar site</span>
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'login',
      title: 'Login/Usuário',
      width: '200px',
      render: (value) => (
        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {value}
        </div>
      ),
    },
    {
      key: 'password',
      title: 'Senha',
      width: '200px',
      render: (value) => (
        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {showPasswords ? value : '••••••••'}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Criado em',
      width: '150px',
      render: (value, record) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString('pt-BR')}
          </p>
          {record.created_by_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              por {record.created_by_name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'updated_at',
      title: 'Atualizado em',
      width: '150px',
      render: (value, record) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString('pt-BR')}
          </p>
          {record.updated_by_name && value !== record.created_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              por {record.updated_by_name}
            </p>
          )}
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar dados
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Header com DataTable */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header customizado */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Busca */}
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar por descrição ou login..."
                  className="pl-4 pr-4 py-2 w-48 sm:w-64 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Botão mostrar/ocultar senhas */}
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title={showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{showPasswords ? 'Ocultar' : 'Mostrar'} senhas</span>
              </button>

              {/* Botão criar */}
              {onCreate && (
                <button
                  onClick={onCreate}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex-shrink-0"
                >
                  <Key className="h-4 w-4" />
                  <span>Novo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo da tabela */}
        <div className="flex-1">
          <DataTable03<ClientAccess>
            data={accesses}
            columns={columns}
            loading={loading}
            
            // Estados vazios
            emptyMessage="Nenhum acesso cadastrado"
            emptyDescription="Comece criando o primeiro acesso."
            emptyIcon={Key}
            
            // Paginação
            pagination={{
              pageSize: 30,
              showTotal: true,
              showSizeChanger: true,
              pageSizeOptions: [10, 30, 50, 100]
            }}
            
            // Clique na linha
            onRowClick={onEdit}
            
            // Ações
            rowActions={[
              ...(onEdit ? [{
                label: 'Editar',
                onClick: onEdit
              }] : []),
              ...(onDelete ? [{
                label: 'Excluir',
                onClick: onDelete,
                variant: 'danger' as const
              }] : [])
            ]}
            
            // Refresh
            onRefresh={onRefresh}
            
            // Estilos
            className="border-0 rounded-none"
            containerClassName="space-y-0"
          />
        </div>
      </div>
    </div>
  );
};