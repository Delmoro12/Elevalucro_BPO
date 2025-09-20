'use client';

import React, { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { ClientsSuppliersTable02 } from '../components/clientsSuppliers/ClientsSuppliersTable02';
import { ClientSupplierModal } from '../components/clientsSuppliers/ClientSupplierModal';
import { useClientsSuppliers } from '../hooks/useClientsSuppliers';
import { ClientSupplier, ClientSupplierFilters, ClientSupplierFormData } from '../types/clientsSuppliers';

interface ClientsSuppliersMainPageProps {
  companyId: string;
  companyName: string;
}

export const ClientsSuppliersMainPage: React.FC<ClientsSuppliersMainPageProps> = ({
  companyId,
  companyName,
}) => {
  const [filters, setFilters] = useState<ClientSupplierFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientSupplier, setSelectedClientSupplier] = useState<ClientSupplier | null>(null);

  const {
    clientsSuppliers,
    loading,
    error,
    total,
    fetchClientsSuppliers,
    createClientSupplier,
    updateClientSupplier,
    deleteClientSupplier,
  } = useClientsSuppliers(companyId);

  const handleFiltersChange = (newFilters: ClientSupplierFilters) => {
    setFilters(newFilters);
    
    // Converter string para boolean para is_active
    const processedFilters = {
      ...newFilters,
      is_active: newFilters.is_active === 'true' ? true : newFilters.is_active === 'false' ? false : undefined,
    };
    
    fetchClientsSuppliers(processedFilters);
  };

  const handleRefresh = () => {
    fetchClientsSuppliers(filters);
  };

  const handleCreateNew = () => {
    setSelectedClientSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (clientSupplier: ClientSupplier) => {
    setSelectedClientSupplier(clientSupplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (clientSupplier: ClientSupplier) => {
    if (window.confirm(`Tem certeza que deseja excluir "${clientSupplier.name}"?`)) {
      const success = await deleteClientSupplier(clientSupplier.id);
      if (success) {
        console.log('Cliente/fornecedor excluído com sucesso');
      }
    }
  };

  const handleModalSave = async (data: ClientSupplierFormData): Promise<boolean> => {
    try {
      if (selectedClientSupplier) {
        // Editar existente
        const success = await updateClientSupplier(selectedClientSupplier.id, data);
        if (success) {
          console.log('Cliente/fornecedor atualizado com sucesso');
          return true;
        }
      } else {
        // Criar novo
        const newClientSupplier = await createClientSupplier(data);
        if (newClientSupplier) {
          console.log('Cliente/fornecedor criado com sucesso');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar cliente/fornecedor:', error);
      return false;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClientSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tabela com DataTable02 */}
      <ClientsSuppliersTable02
        clientsSuppliers={clientsSuppliers}
        loading={loading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        total={total}
      />

      {/* Modal */}
      <ClientSupplierModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        clientSupplier={selectedClientSupplier}
        title={selectedClientSupplier ? 'Editar Cliente/Fornecedor' : 'Novo Cliente/Fornecedor'}
      />
    </div>
  );
};