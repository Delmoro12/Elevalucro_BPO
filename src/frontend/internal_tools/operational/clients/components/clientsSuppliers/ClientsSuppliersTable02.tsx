'use client';

import React from 'react';
import { UserPlus, Building2, Users, Edit2, Trash2, Eye, Phone, Mail, User, CreditCard } from 'lucide-react';
import { DataTable02, DataTable02Column } from '../../../../shared/components/DataTable02';
import { ClientSupplier, ClientSupplierFilters } from '../../types/clientsSuppliers';

interface ClientsSuppliersTable02Props {
  clientsSuppliers: ClientSupplier[];
  loading: boolean;
  filters: ClientSupplierFilters;
  onFiltersChange: (filters: ClientSupplierFilters) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onEdit: (clientSupplier: ClientSupplier) => void;
  onDelete: (clientSupplier: ClientSupplier) => void;
  onView?: (clientSupplier: ClientSupplier) => void;
  total: number;
}

export const ClientsSuppliersTable02: React.FC<ClientsSuppliersTable02Props> = ({
  clientsSuppliers,
  loading,
  filters,
  onFiltersChange,
  onRefresh,
  onCreateNew,
  onEdit,
  onDelete,
  onView,
  total,
}) => {
  
  // Definir colunas da tabela
  const columns: DataTable02Column<ClientSupplier>[] = [
    {
      key: 'name',
      title: 'Nome/Razão Social',
      render: (value, record) => {
        const isCompany = record.type === 'supplier' || record.cnpj;
        const Icon = isCompany ? Building2 : User;
        
        return (
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {record.name}
              </div>
              {(record.cnpj || record.cpf) && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDocument(record.cnpj, record.cpf)}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      title: 'Tipo',
      render: (value) => {
        const colors = {
          client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
          supplier: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        };
        
        const labels = {
          client: 'Cliente',
          supplier: 'Fornecedor',
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {labels[value as keyof typeof labels]}
          </span>
        );
      }
    },
    {
      key: 'contact',
      title: 'Contato',
      render: (value, record) => (
        <div className="space-y-1">
          {record.email_billing && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="h-3 w-3" />
              <span className="truncate">{record.email_billing}</span>
            </div>
          )}
          {record.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="h-3 w-3" />
              <span>{formatPhone(record.phone)}</span>
            </div>
          )}
          {!record.email_billing && !record.phone && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'location',
      title: 'Localização',
      render: (value, record) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {record.city && record.state ? (
            `${record.city}, ${record.state}`
          ) : record.city ? (
            record.city
          ) : record.state ? (
            record.state
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'pix',
      title: 'PIX',
      render: (value, record) => (
        <div className="text-sm">
          {record.pix ? (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <CreditCard className="h-3 w-3" />
              <span className="truncate max-w-32">{record.pix}</span>
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Criado em',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  // Funções auxiliares
  const formatDocument = (cnpj?: string, cpf?: string) => {
    if (cnpj) {
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (cpf) {
      return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return '-';
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  };

  // Filtros customizados
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      is_active: status === 'true' ? true : status === 'false' ? false : undefined,
    });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : type as 'client' | 'supplier',
    });
  };

  return (
    <DataTable02
      data={clientsSuppliers}
      columns={columns}
      loading={loading}
      
      searchValue={filters.search || ''}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar por nome, CNPJ, CPF, email..."
      
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          value: filters.is_active === true ? 'true' : filters.is_active === false ? 'false' : '',
          onChange: handleStatusChange,
          options: [
            { value: 'true', label: 'Ativo' },
            { value: 'false', label: 'Inativo' }
          ]
        }
      ]}
      
      tabs={[
        { 
          key: 'all', 
          label: 'Todos', 
          icon: Users,
          count: total
        },
        { 
          key: 'client', 
          label: 'Clientes', 
          icon: UserPlus,
          count: clientsSuppliers.filter(cs => cs.type === 'client').length
        },
        { 
          key: 'supplier', 
          label: 'Fornecedores', 
          icon: Building2,
          count: clientsSuppliers.filter(cs => cs.type === 'supplier').length
        }
      ]}
      activeTab={filters.type || 'all'}
      onTabChange={handleTypeChange}
      
      onRefresh={onRefresh}
      
      createButton={{
        label: 'Novo Cliente/Fornecedor',
        onClick: onCreateNew
      }}
      
      actions={[
        ...(onView ? [{
          key: 'view',
          icon: Eye,
          title: 'Visualizar',
          onClick: onView
        }] : []),
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
      
      emptyMessage="Nenhum cliente ou fornecedor encontrado"
      emptyDescription={
        filters.search || filters.type !== 'all' || filters.is_active !== undefined
          ? 'Ajuste os filtros para ver mais resultados.'
          : 'Comece adicionando o primeiro cliente ou fornecedor.'
      }
      emptyIcon={UserPlus}
      emptyAction={
        (!filters.search && filters.type === 'all' && filters.is_active === undefined) ? {
          label: 'Adicionar Primeiro Cliente/Fornecedor',
          onClick: onCreateNew
        } : undefined
      }
    />
  );
};