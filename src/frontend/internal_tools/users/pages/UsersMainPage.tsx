'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { UserFilters, BpoUser } from '../types/users';
import { UsersFilters } from '../components/UsersFilters';
import { UsersTableView } from '../components/UsersTableView';
import { UserFormModal, UserFormData } from '../components/UserFormModal';
import { useUsers } from '../hooks/useUsers';
import { upsertBpoUser } from '../services/users.api';

export const UsersMainPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BpoUser | null>(null);
  const { users, loading, error, fetchUsers } = useUsers();

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleRefresh = () => {
    fetchUsers(filters);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: BpoUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (userData: UserFormData) => {
    try {
      await upsertBpoUser(userData);
      handleCloseForm();
      fetchUsers(filters); // Refresh list
    } catch (error) {
      throw error; // Let form handle error display
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestão de usuários e colaboradores BPO
            </p>
          </div>
        </div>
        
        {/* Botão de Criar Novo Usuário */}
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Users className="h-4 w-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <UsersFilters
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

      {/* Tabela de Usuários */}
      <UsersTableView
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onCreate={handleCreateUser}
      />

      {/* Modal de Formulário */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        user={editingUser}
        onSubmit={handleSubmitUser}
      />
    </div>
  );
};