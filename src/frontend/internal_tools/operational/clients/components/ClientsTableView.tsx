'use client';

import React from 'react';
import { Building2, Phone, Mail, Calendar, User } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '../../../shared/components';
import { OperationalClient } from '../types/clients';

interface ClientsTableViewProps {
  clients: OperationalClient[];
  loading?: boolean;
  onClientClick?: (client: OperationalClient) => void;
}

export const ClientsTableView: React.FC<ClientsTableViewProps> = ({
  clients,
  loading = false,
  onClientClick,
}) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      suspenso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      pendente: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.pendente}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plano: string) => {
    const colors = {
      avancado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      gerencial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      controle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[plano as keyof typeof colors] || colors.controle}`}>
        {plano.charAt(0).toUpperCase() + plano.slice(1)}
      </span>
    );
  };

  const columns: TableColumn<OperationalClient>[] = [
    {
      key: 'cliente',
      title: 'Cliente',
      render: (_, record) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {record.nome_empresa}
            </div>
            {record.cnpj && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                CNPJ: {record.cnpj}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contato',
      title: 'Contato',
      render: (_, record) => (
        <div>
          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
            <User className="h-3 w-3 mr-1" />
            {record.nome_contato}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {record.email_contato}
          </div>
          {record.telefone_contato && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Phone className="h-3 w-3 mr-1" />
              {record.telefone_contato}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'plano',
      title: 'Plano',
      render: (_, record) => getPlanBadge(record.plano),
    },
    {
      key: 'valor_mensal',
      title: 'Valor',
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: 'responsavel_operacional',
      title: 'Responsável',
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'data_inicio',
      title: 'Início',
      render: (value) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(value).toLocaleDateString('pt-BR')}
        </div>
      ),
    },
  ];

  const actions: TableAction<OperationalClient>[] = [];

  return (
    <DataTable<OperationalClient>
      data={clients}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="Nenhum cliente encontrado"
      emptyIcon={Building2}
      onRowClick={onClientClick}
    />
  );
};