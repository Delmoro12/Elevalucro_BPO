'use client';

import React from 'react';
import { Folder, Tag, Wallet, Edit2, Trash2 } from 'lucide-react';
import { DataTable02, DataTable02Column } from '../../../../shared/components/DataTable02';
import { 
  FinancialCategory, 
  DREGroup, 
  FinancialAccount,
  ConfigTabType 
} from '../../types/config';

interface ConfigTableProps {
  type: ConfigTabType;
  data: FinancialCategory[] | DREGroup[] | FinancialAccount[];
  loading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTab: ConfigTabType;
  onTabChange: (tab: ConfigTabType) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const ConfigTable: React.FC<ConfigTableProps> = ({
  type,
  data,
  loading,
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  onRefresh,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
  
  // Definir colunas baseado no tipo
  const getColumns = (): DataTable02Column[] => {
    switch (type) {
      case 'categories':
        return [
          {
            key: 'description',
            title: 'Descrição',
            render: (value) => (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{value}</span>
              </div>
            )
          },
          {
            key: 'dre_group_name',
            title: 'Grupo DRE',
            render: (value) => value || <span className="text-slate-400">-</span>
          },
          {
            key: 'created_at',
            title: 'Criado em',
            render: (value) => new Date(value).toLocaleDateString('pt-BR')
          }
        ];
        
      case 'groups':
        return [
          {
            key: 'description',
            title: 'Descrição',
            render: (value) => (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{value}</span>
              </div>
            )
          },
          {
            key: 'type',
            title: 'Tipo',
            render: (value, record) => {
              const group = record as DREGroup;
              return (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  group.type === 'receita' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  {group.type === 'receita' ? '📈 Receita' : '📉 Despesa'}
                </span>
              )
            }
          },
          {
            key: 'sort_order',
            title: 'Ordem',
            render: (value) => (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium">
                {value}
              </span>
            )
          },
          {
            key: 'created_at',
            title: 'Criado em',
            render: (value) => new Date(value).toLocaleDateString('pt-BR')
          }
        ];
        
      case 'accounts':
        return [
          {
            key: 'description',
            title: 'Descrição',
            render: (value) => (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{value}</span>
              </div>
            )
          },
          {
            key: 'created_at',
            title: 'Criado em',
            render: (value) => new Date(value).toLocaleDateString('pt-BR')
          }
        ];
        
      default:
        return [];
    }
  };

  // Labels para botões e mensagens
  const getLabels = () => {
    switch (type) {
      case 'categories':
        return {
          createButton: 'Nova Categoria',
          emptyMessage: 'Nenhuma categoria encontrada',
          emptyDescription: 'Comece criando a primeira categoria financeira.',
          searchPlaceholder: 'Buscar categorias...'
        };
      case 'groups':
        return {
          createButton: 'Novo Grupo',
          emptyMessage: 'Nenhum grupo DRE encontrado',
          emptyDescription: 'Comece criando o primeiro grupo DRE.',
          searchPlaceholder: 'Buscar grupos...'
        };
      case 'accounts':
        return {
          createButton: 'Nova Conta',
          emptyMessage: 'Nenhuma conta encontrada',
          emptyDescription: 'Comece criando a primeira conta financeira.',
          searchPlaceholder: 'Buscar contas...'
        };
      default:
        return {
          createButton: 'Novo',
          emptyMessage: 'Nenhum registro encontrado',
          emptyDescription: 'Comece criando o primeiro registro.',
          searchPlaceholder: 'Buscar...'
        };
    }
  };

  const labels = getLabels();

  return (
    <DataTable02
      data={data}
      columns={getColumns()}
      loading={loading}
      
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={labels.searchPlaceholder}
      
      tabs={[
        { 
          key: 'categories', 
          label: 'Categorias', 
          icon: Tag,
          count: type === 'categories' ? data.length : undefined
        },
        { 
          key: 'groups', 
          label: 'Grupos', 
          icon: Folder,
          count: type === 'groups' ? data.length : undefined
        },
        { 
          key: 'accounts', 
          label: 'Contas', 
          icon: Wallet,
          count: type === 'accounts' ? data.length : undefined
        }
      ]}
      activeTab={activeTab}
      onTabChange={(key: string) => onTabChange(key as ConfigTabType)}
      
      onRefresh={onRefresh}
      
      createButton={{
        label: labels.createButton,
        onClick: onCreateNew
      }}
      
      actions={[
        {
          key: 'edit',
          icon: Edit2,
          title: 'Editar',
          onClick: onEdit
        },
        {
          key: 'delete',
          icon: Trash2,
          title: 'Excluir',
          onClick: onDelete,
          color: 'text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
        }
      ]}
      
      emptyMessage={labels.emptyMessage}
      emptyDescription={labels.emptyDescription}
      emptyIcon={type === 'categories' ? Tag : type === 'groups' ? Folder : Wallet}
    />
  );
};