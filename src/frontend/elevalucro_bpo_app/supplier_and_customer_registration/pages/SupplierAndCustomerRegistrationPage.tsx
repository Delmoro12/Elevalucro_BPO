'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { ClientsSuppliersTable } from '../components/ClientsSuppliersTable';
import { ClientsSuppliersModalSidebar } from '../components/ClientsSuppliersModalSidebar';
import { useClientsSuppliers } from '../hooks/useClientsSuppliers';
import { useAuth } from '../../auth/contexts/AuthContext';
import { ClientSupplier, ClientSupplierFormData } from '../types/clientsSuppliers';

const SupplierAndCustomerRegistrationPage: React.FC = () => {
  const { companyId, user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedClientSupplier, setSelectedClientSupplier] = useState<ClientSupplier | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { 
    clientsSuppliers,
    loading,
    error,
    createClientSupplier,
    updateClientSupplier,
    deleteClientSupplier,
    refetch
  } = useClientsSuppliers(companyId || '');

  const handleCreate = () => {
    setSelectedClientSupplier(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (clientSupplier: ClientSupplier) => {
    setSelectedClientSupplier(clientSupplier);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (clientSupplier: ClientSupplier) => {
    if (confirm(`Tem certeza que deseja excluir "${clientSupplier.name}"?`)) {
      try {
        const success = await deleteClientSupplier(clientSupplier.id);
        if (success) {
          console.log('Cliente/fornecedor excluído com sucesso');
          // Forçar re-render
          setRefreshKey(prev => prev + 1);
        }
      } catch (error) {
        console.error('Erro ao excluir cliente/fornecedor:', error);
        alert('Erro ao excluir cliente/fornecedor');
      }
    }
  };

  const handleSave = async (formData: ClientSupplierFormData): Promise<boolean> => {
    if (!companyId) {
      console.error('Company ID não encontrado');
      return false;
    }
    
    try {
      if (modalMode === 'edit' && selectedClientSupplier) {
        const success = await updateClientSupplier(selectedClientSupplier.id, formData);
        if (success) {
          console.log('Cliente/fornecedor atualizado com sucesso');
          setRefreshKey(prev => prev + 1);
          return true;
        }
      } else {
        const newClientSupplier = await createClientSupplier(formData);
        if (newClientSupplier) {
          console.log('Cliente/fornecedor criado com sucesso');
          setRefreshKey(prev => prev + 1);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar cliente/fornecedor:', error);
      return false;
    }
  };

  const handleRefresh = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClientSupplier(null);
  };

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
          Você precisa estar logado para visualizar os cadastros.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar os cadastros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Cadastros
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gerencie seus clientes e fornecedores
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Table */}
      <ClientsSuppliersTable
        key={refreshKey}
        companyId={companyId}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
      />

      {/* Modal */}
      <ClientsSuppliersModalSidebar
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        clientSupplier={selectedClientSupplier}
        mode={modalMode}
        companyId={companyId}
      />
    </div>
  );
};

export default SupplierAndCustomerRegistrationPage;