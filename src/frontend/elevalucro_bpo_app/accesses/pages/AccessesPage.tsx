'use client';

import React, { useState } from 'react';
import { Key, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { AccessesTable } from '../components/AccessesTable';
import { AccessesModalSidebar } from '../components/AccessesModalSidebar';
import { useAccesses } from '../hooks/useAccesses';
import { useAuth } from '../../auth/contexts/AuthContext';
import { ClientAccess, ClientAccessFormData } from '../types/accesses';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

export const AccessesPage: React.FC = () => {
  const { companyId, user, loading: authLoading, isAuthenticated, subscriptionPlan } = useAuth();
  
  const {
    accesses,
    loading,
    error,
    createAccess,
    updateAccess,
    deleteAccess,
    fetchAccesses,
  } = useAccesses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ClientAccess | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accessToDelete, setAccessToDelete] = useState<ClientAccess | null>(null);

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Você precisa estar logado para visualizar os acessos.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar os acessos.
        </p>
      </div>
    );
  }

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
        return await createAccess(formData);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Acessos
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gerencie os acessos e senhas dos seus sistemas
        </p>
      </div>

      {/* Tabela de Acessos */}
      <AccessesTable
        companyId={companyId}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onCreate={handleCreate}
        onRefresh={fetchAccesses}
      />

      {/* Modal de Criação/Edição */}
      <AccessesModalSidebar
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