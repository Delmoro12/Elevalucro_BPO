'use client';

import React from 'react';
import { Edit, Trash2, Key, ExternalLink, Eye, EyeOff, Search } from 'lucide-react';
import { DataTable03 } from '../../../../../elevalucro_bpo_app/shared/components/DataTable03';
import type { DataTable03Column } from '../../../../../elevalucro_bpo_app/shared/components/DataTable03';
import { ClientAccess } from '../../types/access';

interface AccessTableProps {
  data: ClientAccess[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onEdit?: (access: ClientAccess) => void;
  onDelete?: (access: ClientAccess) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  showPasswords?: boolean;
  onTogglePasswordVisibility?: () => void;
}

export const AccessTable: React.FC<AccessTableProps> = ({
  data,
  loading = false,
  searchValue = '',
  onSearchChange,
  onEdit,
  onDelete,
  onRefresh,
  onCreate,
  showPasswords = false,
  onTogglePasswordVisibility,
}) => {
  const columns: DataTable03Column<ClientAccess>[] = [
    {
      key: 'description',
      title: 'Descrição',
      width: '25%',
      render: (value: string, record: ClientAccess) => (
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            {record.url && (
              <a
                href={record.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
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
      width: '20%',
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {value}
        </div>
      ),
    },
    {
      key: 'password',
      title: 'Senha',
      width: '20%',
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {showPasswords ? value : '••••••••'}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Criado em',
      width: '15%',
      render: (value: string, record: ClientAccess) => (
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
      width: '15%',
      render: (value: string, record: ClientAccess) => (
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
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '5%',
      render: (_: any, record: ClientAccess) => (
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              title="Editar acesso"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Excluir acesso"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header customizado com botões */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Buscar por descrição ou login..."
                className="pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[280px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão mostrar/ocultar senhas */}
            {onTogglePasswordVisibility && (
              <button
                onClick={onTogglePasswordVisibility}
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
            )}

            {/* Botão criar */}
            {onCreate && (
              <button
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Key className="h-4 w-4" />
                <span>Novo Acesso</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo da tabela */}
      <div className="flex-1">
        <DataTable03<ClientAccess>
          data={data}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum acesso cadastrado"
          emptyDescription="Comece adicionando o primeiro acesso do cliente"
          emptyIcon={Key}
          emptyAction={onCreate ? {
            label: 'Cadastrar primeiro acesso',
            onClick: onCreate,
          } : undefined}
          pagination={{
            pageSize: 10,
            showTotal: true,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          className="border-0 rounded-none"
          containerClassName="space-y-0"
        />
      </div>
    </div>
  );
};