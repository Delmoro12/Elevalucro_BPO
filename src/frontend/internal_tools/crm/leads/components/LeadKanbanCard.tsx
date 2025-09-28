'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Building2, Trash2, Calendar, Thermometer, ArrowRight } from 'lucide-react';
import { LeadListItem } from '../types/leads';

interface LeadKanbanCardProps {
  lead: LeadListItem;
  onEdit: (id: string) => void;
  onDelete: (lead: LeadListItem) => void;
  onConvert: (lead: LeadListItem) => void;
  isDeleting: boolean;
  isDragging?: boolean;
}

export const LeadKanbanCard: React.FC<LeadKanbanCardProps> = ({
  lead,
  onEdit,
  onDelete,
  onConvert,
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
  } = useSortable({ id: lead.id });

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

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot':
        return 'text-red-600 dark:text-red-400';
      case 'warm':
        return 'text-orange-600 dark:text-orange-400';
      case 'cold':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'hot':
        return '🔥';
      case 'warm':
        return '🌡️';
      case 'cold':
        return '❄️';
      default:
        return '🌡️';
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
        return plan;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(lead.id)}
      className={`
        bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700
        p-4 cursor-pointer hover:shadow-md transition-shadow
        ${isDragging || isSortableDragging ? 'shadow-lg' : ''}
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {lead.contact_name}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
            {lead.company_name}
          </p>
        </div>
        
        {/* Badge do plano */}
        {lead.plan && (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanoBadgeColor(lead.plan)}`}>
            {getPlanoDisplayName(lead.plan)}
          </span>
        )}
      </div>

      {/* Temperatura */}
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className={`h-3 w-3 ${getTemperatureColor(lead.temperature)}`} />
        <span className={`text-xs font-medium ${getTemperatureColor(lead.temperature)}`}>
          {getTemperatureIcon(lead.temperature)} {lead.temperature.charAt(0).toUpperCase() + lead.temperature.slice(1)}
        </span>
        {lead.lead_source && (
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            {lead.lead_source}
          </span>
        )}
      </div>

      {/* Informações de contato */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{lead.contact_email}</span>
        </div>
        
        {lead.contact_phone && (
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{lead.contact_phone}</span>
          </div>
        )}

        {lead.cnpj && (
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{lead.cnpj}</span>
          </div>
        )}
      </div>

      {/* Segmento e data */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <Building2 className="h-3 w-3 mr-1" />
          {lead.segment || 'Não informado'}
        </div>
        
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(lead.created_at)}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead);
            }}
            disabled={isDeleting}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
            title="Excluir lead"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Botão converter para prospect */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvert(lead);
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/40 rounded transition-colors"
          title="Converter para prospect"
        >
          <ArrowRight className="h-3 w-3" />
          Converter
        </button>
      </div>
    </div>
  );
};