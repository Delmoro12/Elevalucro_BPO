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
import { LeadListItem, LeadKanbanStage } from '../types/leads';
import { KanbanColumn } from '../../prospects/components/KanbanColumn';
import { LeadKanbanCard } from './LeadKanbanCard';

interface LeadsKanbanProps {
  leads: LeadListItem[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onStageChange: (id: string, newStage: LeadKanbanStage) => Promise<boolean>;
  onConvert: (id: string) => Promise<boolean>;
  onEdit: (id: string) => void;
  onLeadUpdate?: () => void;
}

const stageColumns: Array<{ id: LeadKanbanStage; title: string; color: string }> = [
  { id: 'new', title: 'Oportunidades', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'contacted', title: 'Contatados', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'qualified', title: 'Qualificados', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'scheduled', title: 'Agendados', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
  { id: 'lost', title: 'Perdidos', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' }
];

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({
  leads,
  loading,
  onDelete,
  onStageChange,
  onConvert,
  onEdit,
  onLeadUpdate,
}) => {
  const [activeLead, setActiveLead] = useState<LeadListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Organizar leads por estágio e calcular valores totais
  const { leadsByStage, valuesByStage } = useMemo(() => {
    const grouped = stageColumns.reduce((acc, column) => {
      const leadsInColumn = leads.filter(lead => 
        (lead.kanban_stage || 'new') === column.id
      );
      acc.leadsByStage[column.id] = leadsInColumn;
      acc.valuesByStage[column.id] = leadsInColumn.reduce((sum, lead) => 
        sum + (lead.monthly_value || 0), 0
      );
      return acc;
    }, {
      leadsByStage: {} as Record<LeadKanbanStage, LeadListItem[]>,
      valuesByStage: {} as Record<LeadKanbanStage, number>
    });
    
    return grouped;
  }, [leads]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    setActiveLead(lead || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Implementar lógica de drag over se necessário
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadKanbanStage;
    
    // Verificar se o estágio mudou
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.kanban_stage === newStage) return;

    // Atualizar estágio
    await onStageChange(leadId, newStage);
  };

  const handleDeleteClick = async (lead: LeadListItem) => {
    setDeletingId(lead.id);
    const success = await onDelete(lead.id);
    setDeletingId(null);

    if (success && onLeadUpdate) {
      onLeadUpdate();
    }
  };

  const handleConvertClick = async (lead: LeadListItem) => {
    const success = await onConvert(lead.id);
    if (success && onLeadUpdate) {
      onLeadUpdate();
    }
  };

  const handleEditLead = (leadId: string) => {
    onEdit(leadId);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1">
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Carregando leads...</p>
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
          {stageColumns.map((column) => (
            <SortableContext
              key={column.id}
              items={leadsByStage[column.id]?.map(l => l.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                color={column.color}
                count={leadsByStage[column.id]?.length || 0}
                totalValue={valuesByStage[column.id] || 0}
              >
                {leadsByStage[column.id]?.map((lead) => (
                  <LeadKanbanCard
                    key={lead.id}
                    lead={lead}
                    onEdit={handleEditLead}
                    onDelete={handleDeleteClick}
                    onConvert={handleConvertClick}
                    isDeleting={deletingId === lead.id}
                  />
                ))}
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <LeadKanbanCard
              lead={activeLead}
              onEdit={handleEditLead}
              onDelete={handleDeleteClick}
              onConvert={handleConvertClick}
              isDeleting={false}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};