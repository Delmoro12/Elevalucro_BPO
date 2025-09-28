'use client';

import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ProspectListItem, ProspectKanbanStage, ProspectUpdatePayload } from '../types/prospects';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { ProspectEditModal } from './ProspectEditModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useProspectEdit } from '../hooks/useProspectEdit';

interface ProspectsKanbanProps {
  prospects: ProspectListItem[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onKanbanStageChange: (id: string, newStage: ProspectKanbanStage) => Promise<boolean>;
  onProspectUpdate?: () => void;
}

const kanbanColumns: Array<{ id: ProspectKanbanStage; title: string; color: string }> = [
  { id: 'pending', title: 'Pendente', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'contacted', title: 'Contatado', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'contract_sent', title: 'Contrato Enviado', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'signed', title: 'Assinado', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'rejected', title: 'Rejeitado', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' }
];

export const ProspectsKanban: React.FC<ProspectsKanbanProps> = ({
  prospects,
  loading,
  onDelete,
  onKanbanStageChange,
  onProspectUpdate,
}) => {
  const [activeProspect, setActiveProspect] = useState<ProspectListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    prospect: ProspectListItem | null;
  }>({
    isOpen: false,
    prospect: null,
  });

  const prospectEdit = useProspectEdit();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Organizar prospects por kanban stage e calcular valores totais
  const { prospectsByStage, valuesByStage } = useMemo(() => {
    const grouped = kanbanColumns.reduce((acc, column) => {
      const prospectsInColumn = prospects.filter(prospect => 
        (prospect.kanban_stage || 'pending') === column.id
      );
      acc.prospectsByStage[column.id] = prospectsInColumn;
      acc.valuesByStage[column.id] = prospectsInColumn.reduce((sum, prospect) => 
        sum + (prospect.monthly_value || 0), 0
      );
      return acc;
    }, {
      prospectsByStage: {} as Record<ProspectKanbanStage, ProspectListItem[]>,
      valuesByStage: {} as Record<ProspectKanbanStage, number>
    });
    
    return grouped;
  }, [prospects]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const prospect = prospects.find(p => p.id === active.id);
    setActiveProspect(prospect || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Implementar lógica de drag over se necessário
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);

    if (!over) return;

    const prospectId = active.id as string;
    const newStage = over.id as ProspectKanbanStage;
    
    // Verificar se o kanban stage mudou
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect || prospect.kanban_stage === newStage) return;

    // Atualizar kanban stage
    await onKanbanStageChange(prospectId, newStage);
  };

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
      onProspectUpdate();
    }
    return success;
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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {kanbanColumns.map((column) => (
            <SortableContext
              key={column.id}
              items={prospectsByStage[column.id]?.map(p => p.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                color={column.color}
                count={prospectsByStage[column.id]?.length || 0}
                totalValue={valuesByStage[column.id] || 0}
              >
                {prospectsByStage[column.id]?.map((prospect) => (
                  <KanbanCard
                    key={prospect.id}
                    prospect={prospect}
                    onEdit={handleEditProspect}
                    onDelete={handleDeleteClick}
                    isDeleting={deletingId === prospect.id}
                  />
                ))}
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeProspect ? (
            <KanbanCard
              prospect={activeProspect}
              onEdit={handleEditProspect}
              onDelete={handleDeleteClick}
              isDeleting={false}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

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
        prospectName={deleteModalState.prospect?.contact_name || ''}
        prospectCompany={deleteModalState.prospect?.company_name || ''}
        prospectStatus={deleteModalState.prospect?.kanban_stage || 'pending'}
        isDeleting={deletingId === deleteModalState.prospect?.id}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};