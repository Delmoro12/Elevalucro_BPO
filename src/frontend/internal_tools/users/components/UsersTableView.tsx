'use client';

import React from 'react';
import { User, Phone, Mail, Calendar, Shield, CheckCircle, XCircle, Edit, Plus } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '../../shared/components';
import { BpoUser } from '../types/users';

interface UsersTableViewProps {
  users: BpoUser[];
  loading?: boolean;
  onEdit?: (user: BpoUser) => void;
  onCreate?: () => void;
}

export const UsersTableView: React.FC<UsersTableViewProps> = ({
  users,
  loading = false,
  onEdit,
  onCreate,
}) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getProfileBadge = (profileType: string) => {
    const colors = {
      'BPO Operator': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'Vendedor': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'Customer Success': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      'Analista': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'Admin': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[profileType as keyof typeof colors] || colors.Admin}`}>
        {profileType}
      </span>
    );
  };

  const columns: TableColumn<BpoUser>[] = [
    {
      key: 'usuario',
      title: 'Usuário',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {record.full_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'perfil',
      title: 'Perfil',
      render: (_, record) => getProfileBadge(record.profile_type),
    },
    {
      key: 'contato',
      title: 'Contato',
      render: (_, record) => (
        <div className="text-sm">
          {record.phone ? (
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <Phone className="h-4 w-4 mr-1" />
              {record.phone}
            </div>
          ) : (
            <span className="text-gray-400">Não informado</span>
          )}
        </div>
      ),
    },
    {
      key: 'verificacao',
      title: 'Verificação',
      render: (_, record) => (
        <div className="flex items-center">
          {record.is_verified ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Verificado</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <XCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Pendente</span>
            </div>
          )}
          <div className="text-xs text-gray-500 ml-2">
            {record.verification_level}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: 'criado_em',
      title: 'Criado em',
      render: (_, record) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(record.created_at).toLocaleDateString('pt-BR')}
        </div>
      ),
    },
  ];

  const actions: TableAction<BpoUser>[] = [
    {
      key: 'edit',
      title: 'Editar',
      icon: Edit,
      onClick: onEdit || (() => {}),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      loading={loading}
    />
  );
};