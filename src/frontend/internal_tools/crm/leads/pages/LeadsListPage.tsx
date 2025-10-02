'use client';

import React, { useState } from 'react';
import { Target, LayoutGrid, Table, Plus, FileText } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { LeadsFilters } from '../components/LeadsFilters';
import { LeadsTable } from '../components/LeadsTable';
import { LeadsKanban } from '../components/LeadsKanban';
import { LeadEditModal } from '../components/LeadEditModal';
import { ICPDocumentPage } from './ICPDocumentPage';
import { convertLeadToProspect, updateLead, getLeadById, createLead } from '../services/leadsCrud';
import { LeadEditData, LeadUpdatePayload } from '../types/leads';

export const LeadsListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [currentPage, setCurrentPage] = useState<'leads' | 'icp'>('leads');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadEditData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const {
    leads,
    loading,
    error,
    filters,
    updateFilters,
    deleteLead,
    updateKanbanStage,
    refreshLeads,
  } = useLeads();

  const handleConvertLead = async (leadId: string) => {
    try {
      const success = await convertLeadToProspect(leadId);
      if (success) {
        refreshLeads(); // Atualizar lista após conversão
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      return false;
    }
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEditLead = async (leadId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      setEditingLead(null); // Limpar dados anteriores
      setIsModalOpen(true); // Abrir modal primeiro para mostrar loading
      
      const leadData = await getLeadById(leadId);
      setEditingLead(leadData);
    } catch (error) {
      setModalError('Erro ao carregar dados do lead');
      console.error('Erro ao carregar lead:', error);
      setIsModalOpen(false); // Fechar modal se houver erro
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveLead = async (data: LeadUpdatePayload) => {
    try {
      setModalSaving(true);
      setModalError(null);

      let success = false;
      if (editingLead) {
        // Editando lead existente
        success = await updateLead(editingLead.id, data);
      } else {
        // Criando novo lead
        success = await createLead(data as any); // Type assertion temporária
      }

      if (success) {
        refreshLeads();
        return true;
      }
      return false;
    } catch (error) {
      setModalError('Erro ao salvar lead');
      console.error('Erro ao salvar lead:', error);
      return false;
    } finally {
      setModalSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setModalError(null);
  };

  const handleICPDocumentView = () => {
    setCurrentPage('icp');
  };

  const handleBackToLeads = () => {
    setCurrentPage('leads');
  };

  // Se estiver visualizando o documento ICP, renderizar a página do ICP
  if (currentPage === 'icp') {
    return <ICPDocumentPage onBack={handleBackToLeads} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            Lista de Leads
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie todos os leads do funil de vendas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão ICP */}
          <button
            onClick={handleICPDocumentView}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            ICP
          </button>

          {/* Botão Novo Lead */}
          <button
            onClick={handleCreateLead}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Lead
          </button>

          {/* Toggle de visualização */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <Table className="h-4 w-4" />
              Tabela
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <LeadsFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onRefresh={refreshLeads}
      />

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar leads
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={refreshLeads}
                  className="bg-red-100 dark:bg-red-800 px-3 py-1 rounded text-sm text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {viewMode === 'kanban' ? (
        <LeadsKanban
          leads={leads}
          loading={loading}
          onDelete={deleteLead}
          onStageChange={updateKanbanStage}
          onConvert={handleConvertLead}
          onEdit={handleEditLead}
          onLeadUpdate={refreshLeads}
        />
      ) : (
        <LeadsTable
          leads={leads}
          loading={loading}
          onDelete={deleteLead}
          onStageChange={updateKanbanStage}
          onConvert={handleConvertLead}
          onEdit={handleEditLead}
          onLeadUpdate={refreshLeads}
        />
      )}

      {/* Informações adicionais */}
      {!loading && leads.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              Mostrando {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4">
              <div>🔥 Quentes: {leads.filter(l => l.temperature === 'hot').length}</div>
              <div>🌡️ Mornos: {leads.filter(l => l.temperature === 'warm').length}</div>
              <div>❄️ Frios: {leads.filter(l => l.temperature === 'cold').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição/criação */}
      <LeadEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
        leadData={editingLead}
        loading={modalLoading}
        saving={modalSaving}
        error={modalError}
        isCreating={!editingLead}
      />
    </div>
  );
};