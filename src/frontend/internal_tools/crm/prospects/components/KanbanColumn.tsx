'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ProspectKanbanStage } from '../types/prospects';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  totalValue: number;
  children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  count,
  totalValue,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[280px] max-w-[320px] h-full
        ${isOver ? 'opacity-75' : ''}
      `}
    >
      {/* Header da coluna */}
      <div className={`
        px-4 py-3 rounded-t-lg border-2 border-b-0 ${color}
        flex flex-col gap-2
      `}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300">
            {title}
          </h3>
          <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full text-xs font-medium">
            {count}
          </span>
        </div>
        
        {/* Valor total da coluna */}
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Corpo da coluna */}
      <div className={`
        flex-1 border-2 border-t-0 rounded-b-lg ${color}
        h-[calc(100vh-280px)] p-3 space-y-3 overflow-y-auto
        ${isOver ? 'bg-opacity-50' : ''}
      `}>
        {children}
        
        {/* Placeholder quando vazio */}
        {count === 0 && (
          <div className="flex items-center justify-center h-24 text-slate-400 dark:text-slate-500 text-sm">
            Nenhum prospect
          </div>
        )}
      </div>
    </div>
  );
};