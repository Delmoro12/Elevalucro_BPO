'use client';

import React, { useState } from 'react';
import { Key, Trash2 } from 'lucide-react';
import { AccessTable } from '../components/access/AccessTable';
import { AccessModal } from '../components/access/AccessModal';
import { useClientsAccess } from '../hooks/useClientsAccess';
import { ClientAccess, ClientAccessFormData } from '../types/access';
import { ConfirmationModal } from '@/src/frontend/shared/components/ConfirmationModal';

interface AccessPageProps {
  companyId: string;
}

export const AccessPage: React.FC<AccessPageProps> = ({ companyId }) => {
  const {
    access,
    loading,
    error,
    createAccess,
    updateAccess,
    deleteAccess,
    fetchAccess,
    updateFilters,
    filters,
  } = useClientsAccess(companyId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ClientAccess | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accessToDelete, setAccessToDelete] = useState<ClientAccess | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  // Handlers do modal
  const handleCreate = () => {
    setSelectedAccess(null);
    setIsModalOpen(true);
  };

  const handleEdit = (access: ClientAccess) => {
    setSelectedAccess(access);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccess(null);
  };

  const handleSave = async (formData: ClientAccessFormData): Promise<boolean> => {
    try {
      if (selectedAccess) {
        // Atualizar acesso existente
        return await updateAccess(selectedAccess.id, formData);
      } else {
        // Criar novo acesso
        return await createAccess({
          company_id: companyId,
          ...formData,
        });
      }
    } catch (error) {
      console.error('Error saving access:', error);
      return false;
    }
  };

  // Handlers para deletar
  const handleDeleteClick = (access: ClientAccess) => {
    setAccessToDelete(access);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accessToDelete) return;

    try {
      const success = await deleteAccess(accessToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setAccessToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting access:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccessToDelete(null);
  };

  // Handler para busca
  const handleSearch = (value: string) => {
    updateFilters({ search: value });
  };

  return (
    <div className="space-y-6">

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            <strong>Erro:</strong> {error}
          </div>
        </div>
      )}

      {/* Tabela */}
      <AccessTable
        data={access}
        loading={loading}
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onRefresh={fetchAccess}
        onCreate={handleCreate}
        showPasswords={showPasswords}
        onTogglePasswordVisibility={() => setShowPasswords(!showPasswords)}
      />

      {/* Modal de Criação/Edição */}
      <AccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        access={selectedAccess}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Acesso"
        message={`Tem certeza que deseja excluir o acesso "${accessToDelete?.description}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};