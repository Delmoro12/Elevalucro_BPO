'use client';

import React from 'react';
import { Folder, Tag, Wallet } from 'lucide-react';
import { DataTable03, DataTable03Column } from '../../shared/components/DataTable03';
import { 
  FinancialCategory, 
  DREGroup, 
  FinancialAccount,
  ConfigTabType 
} from '../types/config';

interface ConfigTableProps {
  type: ConfigTabType;
  data: FinancialCategory[] | DREGroup[] | FinancialAccount[];
  loading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTab: ConfigTabType;
  onTabChange: (tab: ConfigTabType) => void;
  onRefresh: () => void;
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
}) => {
  
  // Definir colunas baseado no tipo
  const getColumns = (): DataTable03Column[] => {
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

  // Labels para mensagens
  const getLabels = () => {
    switch (type) {
      case 'categories':
        return {
          emptyMessage: 'Nenhuma categoria encontrada',
          emptyDescription: 'Não há categorias financeiras cadastradas para visualizar.',
          searchPlaceholder: 'Buscar categorias...'
        };
      case 'groups':
        return {
          emptyMessage: 'Nenhum grupo DRE encontrado',
          emptyDescription: 'Não há grupos DRE cadastrados para visualizar.',
          searchPlaceholder: 'Buscar grupos...'
        };
      case 'accounts':
        return {
          emptyMessage: 'Nenhuma conta encontrada',
          emptyDescription: 'Não há contas financeiras cadastradas para visualizar.',
          searchPlaceholder: 'Buscar contas...'
        };
      default:
        return {
          emptyMessage: 'Nenhum registro encontrado',
          emptyDescription: 'Não há registros para visualizar.',
          searchPlaceholder: 'Buscar...'
        };
    }
  };

  const labels = getLabels();

  return (
    <DataTable03
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
      onTabChange={onTabChange}
      
      onRefresh={onRefresh}
      
      emptyMessage={labels.emptyMessage}
      emptyDescription={labels.emptyDescription}
      emptyIcon={type === 'categories' ? Tag : type === 'groups' ? Folder : Wallet}
    />
  );
};