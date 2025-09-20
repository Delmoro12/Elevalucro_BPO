'use client';

import React, { useState } from 'react';
import { FinancialRegistersTable } from '../components/FinancialRegistersTable';
import { FinancialRegistersModalSidebar } from '../components/FinancialRegistersModalSidebar';
import { FileText } from 'lucide-react';
import { FinancialRegister, FinancialRegisterFormData } from '../types/financialRegisters';
import { financialRegistersApi } from '../services/financialRegisters.api';
import { useFinancialRegisters } from '../hooks/useFinancialRegisters';
import { useAuth } from '../../auth/contexts/AuthContext';

const FinancialRegistersPage: React.FC = () => {
  const { companyId, user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRegister, setSelectedRegister] = useState<FinancialRegister | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key para forçar re-render da tabela
  
  const { refetch } = useFinancialRegisters(companyId || '');

  const handleCreate = () => {
    setSelectedRegister(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (register: FinancialRegister) => {
    setSelectedRegister(register);
    // Se o registro está validado, abrir em modo visualização
    setModalMode(register.validated ? 'view' : 'edit');
    setModalOpen(true);
  };

  const handleDelete = async (register: FinancialRegister) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await financialRegistersApi.delete(register.id, register.type);
        refetch();
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
        alert('Erro ao excluir registro');
      }
    }
  };

  const handleSave = async (formData: FinancialRegisterFormData): Promise<boolean> => {
    if (!companyId) return false;
    
    try {
      if (modalMode === 'edit' && selectedRegister) {
        await financialRegistersApi.update(selectedRegister.id, formData, selectedRegister.type);
      } else {
        await financialRegistersApi.create(companyId, formData);
      }
      
      // Limpar estado do modal antes de refetch para garantir fechamento
      setModalOpen(false);
      setSelectedRegister(null);
      
      // Forçar re-render da tabela incrementando a key
      setRefreshKey(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      return false;
    }
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
          Você precisa estar logado para visualizar os registros financeiros.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar os registros financeiros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Registros Financeiros
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gerencie seus lançamentos de entradas e saídas
          </p>
        </div>
      </div>

      {/* Table */}
      <FinancialRegistersTable
        key={refreshKey} // Forçar re-render quando refreshKey muda
        companyId={companyId}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={refetch}
      />

      {/* Modal */}
      <FinancialRegistersModalSidebar
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        register={selectedRegister}
        mode={modalMode}
        companyId={companyId}
      />
    </div>
  );
};

export default FinancialRegistersPage;