'use client';

import React, { useState } from 'react';
import { AccountsPayableTable } from '../components/accountsPayable/AccountsPayableTable';
import { AccountsPayableModalSidebar } from '../components/accountsPayable/AccountsPayableModalSidebar';
import { useAccountsPayable } from '../hooks/useAccountsPayable';
import { useConfig } from '../hooks/useConfig';
import { useClientsSuppliers } from '../hooks/useClientsSuppliers';
import { AccountPayable, AccountPayableFormData } from '../types/accountsPayable';
import { accountsPayableRecurrenceService } from '../services/accountsPayableRecurrence.service';
import { Trash2, Trash } from 'lucide-react';

interface AccountsPayableMainPageProps {
  companyId: string;
  companyName: string;
}

export const AccountsPayableMainPage: React.FC<AccountsPayableMainPageProps> = ({
  companyId,
  companyName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSeriesDeleteConfirm, setShowSeriesDeleteConfirm] = useState<string | null>(null);
  const [showSeriesEditConfirm, setShowSeriesEditConfirm] = useState<{
    account: AccountPayable;
    formData: AccountPayableFormData;
  } | null>(null);
  
  // Hooks para dados
  const { 
    accountsPayable, 
    loading, 
    error, 
    createAccountPayable, 
    updateAccountPayable, 
    deleteAccountPayable,
    fetchAccountsPayable 
  } = useAccountsPayable(companyId);
  
  const { financialCategories } = useConfig(companyId);
  const { clientsSuppliers } = useClientsSuppliers(companyId);

  const handleCreate = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: AccountPayable) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleView = (account: AccountPayable) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteSeries = (seriesId: string) => {
    setShowSeriesDeleteConfirm(seriesId);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    const success = await deleteAccountPayable(showDeleteConfirm);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const confirmDeleteSeries = async () => {
    if (!showSeriesDeleteConfirm) return;
    
    try {
      console.log('🗑️ Deletando série:', showSeriesDeleteConfirm);
      
      // Chamar serviço para deletar série (todas as contas não pagas)
      const result = await accountsPayableRecurrenceService.deleteRecurringSeries(
        showSeriesDeleteConfirm, 
        'unpaid'
      );
      
      console.log('✅ Série deletada:', result);
      setShowSeriesDeleteConfirm(null);
      fetchAccountsPayable(); // Refresh data
    } catch (error) {
      console.error('❌ Erro ao excluir série:', error);
      // TODO: Mostrar toast de erro para o usuário
    }
  };

  const handleSave = async (data: AccountPayableFormData): Promise<boolean> => {
    try {
      if (selectedAccount) {
        // Update existing
        const success = await updateAccountPayable(selectedAccount.id, data);
        return success;
      } else {
        // Create new
        const result = await createAccountPayable(data);
        return result !== null;
      }
    } catch (error) {
      console.error('Erro ao salvar conta a pagar:', error);
      return false;
    }
  };

  // Função chamada quando usuário tenta editar conta que faz parte de série
  const handleSeriesEditRequest = (account: AccountPayable, formData: AccountPayableFormData) => {
    setShowSeriesEditConfirm({ account, formData });
  };

  // Editar apenas uma conta da série
  const handleSingleEdit = async () => {
    if (!showSeriesEditConfirm) return;
    
    try {
      const success = await updateAccountPayable(showSeriesEditConfirm.account.id, showSeriesEditConfirm.formData);
      if (success) {
        setShowSeriesEditConfirm(null);
        setIsModalOpen(false);
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error('❌ Erro ao editar conta individual:', error);
    }
  };

  // Editar série completa
  const handleSeriesEdit = async (updateType: 'future' | 'all') => {
    if (!showSeriesEditConfirm) return;
    
    try {
      console.log('📝 Editando série:', showSeriesEditConfirm.account.series_id, updateType);
      
      await accountsPayableRecurrenceService.updateRecurringSeries(
        showSeriesEditConfirm.account.series_id!,
        showSeriesEditConfirm.formData,
        updateType
      );
      
      console.log('✅ Série editada com sucesso');
      setShowSeriesEditConfirm(null);
      setIsModalOpen(false);
      setSelectedAccount(null);
      fetchAccountsPayable(); // Refresh data
    } catch (error) {
      console.error('❌ Erro ao editar série:', error);
    }
  };

  const getModalTitle = () => {
    if (!selectedAccount) return 'Nova Conta a Pagar';
    return 'Editar Conta a Pagar';
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-400">
          Erro ao carregar contas a pagar: {error}
        </p>
        <button
          onClick={fetchAccountsPayable}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountsPayableTable
        accountsPayable={accountsPayable}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onRefresh={fetchAccountsPayable}
        onDeleteSeries={handleDeleteSeries}
      />

      {/* Modal Sidebar */}
      <AccountsPayableModalSidebar
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleSave}
        onSeriesEditRequest={handleSeriesEditRequest}
        title={getModalTitle()}
        account={selectedAccount}
        categories={financialCategories}
        suppliers={clientsSuppliers}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirmar Exclusão
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Tem certeza de que deseja excluir esta conta a pagar? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}


      {/* Series Delete Confirmation Modal */}
      {showSeriesDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Trash className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Excluir Série Completa
                </h3>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
                <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                  ⚠️ Ação irreversível
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  <strong>Série ID:</strong> {showSeriesDeleteConfirm}
                </p>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Tem certeza de que deseja excluir <strong>toda a série</strong> de contas? 
                Isso excluirá todas as contas não pagas desta série (incluindo a conta pai se não estiver paga). Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSeriesDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteSeries}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Excluir Série
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Series Edit Confirmation Modal */}
      {showSeriesEditConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Editar Série de Contas
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Série ID:</strong> {showSeriesEditConfirm.account.series_id}
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                  Esta conta faz parte de uma série recorrente. Como você gostaria de aplicar as alterações?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    Apenas esta conta
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Altera somente o registro atual, mantendo os demais inalterados
                  </p>
                </div>
                
                <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    Esta e próximas em aberto
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Altera esta conta e todas as próximas não pagas da série (recomendado)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSeriesEditConfirm(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleSingleEdit}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Apenas esta
                </button>
                
                <button
                  onClick={() => handleSeriesEdit('future')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Esta e próximas
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};