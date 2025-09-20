import React, { useState } from 'react';
import { Mail, Phone, Building2, Trash2, Eye, Calendar } from 'lucide-react';
import { ProspectListItem, ProspectStatus, ProspectUpdatePayload } from '../types/prospects';
import { StatusBadge } from './StatusBadge';
import { ProspectEditModal } from './ProspectEditModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useProspectEdit } from '../hooks/useProspectEdit';

interface ProspectsTableProps {
  prospects: ProspectListItem[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onStatusChange: (id: string, newStatus: ProspectStatus) => Promise<boolean>;
  onProspectUpdate?: () => void; // Callback para recarregar a lista após edição
}

export const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects,
  loading,
  onDelete,
  onStatusChange,
  onProspectUpdate,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    prospect: ProspectListItem | null;
  }>({
    isOpen: false,
    prospect: null,
  });
  const prospectEdit = useProspectEdit();

  const handleDeleteClick = (prospect: ProspectListItem) => {
    setDeleteModalState({
      isOpen: true,
      prospect,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.prospect) return;

    setDeletingId(deleteModalState.prospect.id);
    const success = await onDelete(deleteModalState.prospect.id);
    setDeletingId(null);

    if (success) {
      setDeleteModalState({ isOpen: false, prospect: null });
      // Opcional: mostrar toast de sucesso
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalState({ isOpen: false, prospect: null });
  };

  const handleEditProspect = async (prospectId: string) => {
    await prospectEdit.openModal(prospectId);
  };

  const handleSaveProspect = async (data: ProspectUpdatePayload) => {
    const success = await prospectEdit.saveProspect(data);
    if (success && onProspectUpdate) {
      onProspectUpdate(); // Recarrega a lista
    }
    return success;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlanoBadgeColor = (plan: string) => {
    switch (plan) {
      case 'controle':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'gerencial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'avancado':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getPlanoDisplayName = (plan: string) => {
    switch (plan) {
      case 'controle':
        return 'Controle';
      case 'gerencial':
        return 'Gerencial';
      case 'avancado':
        return 'Avançado';
      default:
        return plano;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1">
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Carregando prospects...</p>
        </div>
      </div>
    );
  }

  if (prospects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1">
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Nenhum prospect encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1">
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Plano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {prospect.contact_name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {prospect.contact_email}
                    </div>
                    {prospect.contact_phone && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {prospect.contact_phone}
                      </div>
                    )}
                    {prospect.contact_role && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {prospect.contact_role}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {prospect.company_name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {prospect.cnpj}
                    </div>
                    {prospect.segment && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {prospect.segment}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanoBadgeColor(prospect.plan)}`}>
                    {getPlanoDisplayName(prospect.plan)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    currentStatus={prospect.status || 'pending'}
                    prospectId={prospect.id}
                    prospectName={prospect.contact_name}
                    onStatusChange={onStatusChange}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                  R$ {prospect.monthly_value.toLocaleString()}/mês
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(prospect.created_at)}
                  </div>
                  {prospect.source && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {prospect.source}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleEditProspect(prospect.id)}
                      className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                      title="Editar prospect"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(prospect)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir prospect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <ProspectEditModal
        isOpen={prospectEdit.isOpen}
        prospectData={prospectEdit.prospectData}
        loading={prospectEdit.loading}
        saving={prospectEdit.saving}
        error={prospectEdit.error}
        onClose={prospectEdit.closeModal}
        onSave={handleSaveProspect}
      />

      {/* Modal de Confirmação de Deleção */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        prospectName={deleteModalState.prospect?.nome_contato || ''}
        prospectCompany={deleteModalState.prospect?.nome_empresa || ''}
        prospectStatus={deleteModalState.prospect?.status || 'pending'}
        isDeleting={deletingId === deleteModalState.prospect?.id}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};