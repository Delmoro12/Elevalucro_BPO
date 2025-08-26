'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Building2, Eye, Trash2, Calendar, DollarSign } from 'lucide-react';
import { ProspectListItem } from '../types/prospects';

interface KanbanCardProps {
  prospect: ProspectListItem;
  onEdit: (id: string) => void;
  onDelete: (prospect: ProspectListItem) => void;
  isDeleting: boolean;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  prospect,
  onEdit,
  onDelete,
  isDeleting,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: prospect.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPlanoBadgeColor = (plano: string) => {
    switch (plano) {
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

  const getPlanoDisplayName = (plano: string) => {
    switch (plano) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700
        p-4 cursor-grab hover:shadow-md transition-shadow
        ${isDragging || isSortableDragging ? 'shadow-lg' : ''}
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {prospect.nome_contato}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
            {prospect.nome_empresa}
          </p>
        </div>
        
        {/* Badge do plano */}
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanoBadgeColor(prospect.plano)}`}>
          {getPlanoDisplayName(prospect.plano)}
        </span>
      </div>

      {/* Informações de contato */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{prospect.email_contato}</span>
        </div>
        
        {prospect.telefone_contato && (
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{prospect.telefone_contato}</span>
          </div>
        )}

        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{prospect.cnpj}</span>
        </div>
      </div>

      {/* Valor e data */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <DollarSign className="h-3 w-3 mr-1" />
          R$ {prospect.valor_mensal.toLocaleString()}/mês
        </div>
        
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(prospect.created_at)}
        </div>
      </div>


      {/* Ações */}
      <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(prospect.id);
          }}
          className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
          title="Editar prospect"
        >
          <Eye className="h-4 w-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(prospect);
          }}
          disabled={isDeleting}
          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
          title="Excluir prospect"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};