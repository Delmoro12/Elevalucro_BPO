'use client';

import React, { useState } from 'react';
import { Plus, Users, Building2, User, Mail, Phone, MessageCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03Tab, 
  DataTable03DateFilter,
  DataTable03SelectFilter
} from '../../shared/components/DataTable03';
import { ClientSupplier, ClientSupplierStatusTab, ClientSupplierFilters } from '../types/clientsSuppliers';
import { useClientsSuppliers } from '../hooks/useClientsSuppliers';

interface TabCounts {
  all: number;
  clients: number;
  suppliers: number;
}

interface ClientsSuppliersTableProps {
  companyId: string;
  onEdit?: (clientSupplier: ClientSupplier) => void;
  onDelete?: (clientSupplier: ClientSupplier) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export const ClientsSuppliersTable: React.FC<ClientsSuppliersTableProps> = ({
  companyId,
  onEdit,
  onDelete,
  onCreate,
  onRefresh
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ClientSupplierStatusTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Hook para buscar dados reais
  const { clientsSuppliers, loading, error } = useClientsSuppliers(companyId);

  // Calcular contadores para as tabs
  const getTabCounts = (): TabCounts => {
    return clientsSuppliers.reduce((acc: TabCounts, cs: ClientSupplier) => {
      acc.all++;
      
      if (cs.type === 'client') acc.clients++;
      else if (cs.type === 'supplier') acc.suppliers++;
      
      return acc;
    }, { all: 0, clients: 0, suppliers: 0 });
  };

  const tabCounts = getTabCounts();

  // Filtrar dados baseado nas seleções
  const filteredData = clientsSuppliers.filter(cs => {
    // Filtro por tab
    if (activeTab === 'clients' && cs.type !== 'client') return false;
    if (activeTab === 'suppliers' && cs.type !== 'supplier') return false;


    // Filtro por status
    if (statusFilter === 'active' && !cs.is_active) return false;
    if (statusFilter === 'inactive' && cs.is_active) return false;

    // Filtro de busca
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const searchText = `${cs.name || ''} ${cs.cnpj || ''} ${cs.cpf || ''} ${cs.email_billing || ''}`.toLowerCase();
      if (!searchText.includes(search)) return false;
    }

    return true;
  });

  // Definir colunas da tabela
  const columns: DataTable03Column<ClientSupplier>[] = [
    {
      key: 'type',
      title: 'Tipo',
      width: '100px',
      render: (value, record) => {
        const isClient = record.type === 'client';
        const Icon = isClient ? User : Building2;
        const color = isClient 
          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${color} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {isClient ? 'Cliente' : 'Fornecedor'}
          </span>
        );
      }
    },
    {
      key: 'name',
      title: 'Nome/Razão Social',
      width: '300px',
      render: (value, record) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900 dark:text-white truncate">
            {record.name}
          </div>
          {(record.cnpj || record.cpf) && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {record.cnpj ? `CNPJ: ${record.cnpj}` : `CPF: ${record.cpf}`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contacts',
      title: 'Contatos',
      width: '200px',
      render: (value, record) => (
        <div className="space-y-1">
          {record.email_billing && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="h-3 w-3" />
              <span className="truncate">{record.email_billing}</span>
            </div>
          )}
          {record.whatsapp && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <MessageCircle className="h-3 w-3" />
              <span>{record.whatsapp}</span>
            </div>
          )}
          {record.phone && !record.whatsapp && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Phone className="h-3 w-3" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      title: 'Localização',
      width: '150px',
      render: (value, record) => {
        if (!record.city && !record.state) return '-';
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {record.city && record.state ? `${record.city}, ${record.state}` : 
             record.city || record.state}
          </div>
        );
      }
    },
    {
      key: 'pix',
      title: 'PIX',
      width: '120px',
      render: (value, record) => {
        if (!record.pix) return '-';
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <CreditCard className="h-3 w-3" />
            <span className="truncate">{record.pix}</span>
          </div>
        );
      }
    },
    {
      key: 'is_active',
      title: 'Status',
      width: '100px',
      render: (value, record) => {
        if (record.is_active) {
          return (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
              ✅ Ativo
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
              ⏸️ Inativo
            </span>
          );
        }
      }
    }
  ];

  // Definir tabs
  const tabs: DataTable03Tab[] = [
    { key: 'all', label: 'Todos', icon: Users, count: tabCounts.all },
    { key: 'clients', label: 'Clientes', icon: User, count: tabCounts.clients },
    { key: 'suppliers', label: 'Fornecedores', icon: Building2, count: tabCounts.suppliers }
  ];


  const statusFilterOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
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

      {/* DataTable */}
      <DataTable03<ClientSupplier>
        data={filteredData}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por nome, CNPJ, CPF, email..."
        
        // Filtros selecionáveis
        filters={[
          {
            key: 'status',
            type: 'select',
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusFilterOptions,
            placeholder: 'Filtrar por status',
            label: 'Status'
          }
        ]}
        
        // Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as ClientSupplierStatusTab)}
        
        // Paginação
        pagination={{
          pageSize: 30,
          showTotal: true,
          showSizeChanger: true,
          pageSizeOptions: [10, 30, 50, 100]
        }}
        
        // Estados vazios
        emptyMessage="Nenhum cliente/fornecedor encontrado"
        emptyDescription="Comece criando o primeiro cliente ou fornecedor."
        emptyIcon={Users}
        
        // Botão de criação
        createButton={onCreate ? {
          label: 'Novo',
          icon: Plus,
          onClick: onCreate
        } : undefined}
        
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
        className="shadow-sm"
      />
    </div>
  );
};